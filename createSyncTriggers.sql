-- createSyncTriggers.sql
-- Create triggers to automatically sync data when new records are added

-- 1. Function to auto-generate BLS results when all 5 checklist results exist
CREATE OR REPLACE FUNCTION auto_generate_bls_result()
RETURNS TRIGGER AS $$
DECLARE
    user_id_val UUID;
    checklist_count INTEGER;
    quiz_pretest_count INTEGER;
    quiz_posttest_count INTEGER;
    one_man_cpr_details JSONB;
    two_man_cpr_details JSONB;
    infant_cpr_details JSONB;
    adult_choking_details JSONB;
    infant_choking_details JSONB;
    overall_pass BOOLEAN;
    remedial_allowed BOOLEAN;
    certified BOOLEAN;
BEGIN
    -- Get the user_id from the inserted record
    user_id_val := NEW.user_id;
    
    -- Check if all 5 checklist results exist for this user
    SELECT COUNT(*) INTO checklist_count
    FROM checklist_results
    WHERE user_id = user_id_val;
    
    -- Check if both quiz sessions exist
    SELECT COUNT(*) INTO quiz_pretest_count
    FROM quiz_sessions
    WHERE user_id = user_id_val AND quiz_key = 'pretest';
    
    SELECT COUNT(*) INTO quiz_posttest_count
    FROM quiz_sessions
    WHERE user_id = user_id_val AND quiz_key = 'posttest';
    
    -- Only proceed if all required data exists
    IF checklist_count = 5 AND quiz_pretest_count = 1 AND quiz_posttest_count = 1 THEN
        -- Check if BLS result already exists
        IF NOT EXISTS (SELECT 1 FROM bls_results WHERE user_id = user_id_val) THEN
            -- Get checklist details for each station
            SELECT checklist_details INTO one_man_cpr_details
            FROM checklist_results
            WHERE user_id = user_id_val AND checklist_type = 'one-man-cpr';
            
            SELECT checklist_details INTO two_man_cpr_details
            FROM checklist_results
            WHERE user_id = user_id_val AND checklist_type = 'two-man-cpr';
            
            SELECT checklist_details INTO infant_cpr_details
            FROM checklist_results
            WHERE user_id = user_id_val AND checklist_type = 'infant-cpr';
            
            SELECT checklist_details INTO adult_choking_details
            FROM checklist_results
            WHERE user_id = user_id_val AND checklist_type = 'adult-choking';
            
            SELECT checklist_details INTO infant_choking_details
            FROM checklist_results
            WHERE user_id = user_id_val AND checklist_type = 'infant-choking';
            
            -- Calculate overall pass status (simplified logic)
            overall_pass := (
                (one_man_cpr_details IS NOT NULL) AND
                (two_man_cpr_details IS NOT NULL) AND
                (infant_cpr_details IS NOT NULL) AND
                (adult_choking_details IS NOT NULL) AND
                (infant_choking_details IS NOT NULL)
            );
            
            -- Set remedial and certification status
            remedial_allowed := NOT overall_pass;
            certified := overall_pass;
            
            -- Insert BLS result
            INSERT INTO bls_results (
                user_id,
                one_man_cpr_details,
                two_man_cpr_details,
                infant_cpr_details,
                adult_choking_details,
                infant_choking_details,
                one_man_cpr_pass,
                two_man_cpr_pass,
                infant_cpr_pass,
                adult_choking_pass,
                infant_choking_pass,
                remedial_allowed,
                certified,
                created_at,
                updated_at
            ) VALUES (
                user_id_val,
                one_man_cpr_details,
                two_man_cpr_details,
                infant_cpr_details,
                adult_choking_details,
                infant_choking_details,
                overall_pass,
                overall_pass,
                overall_pass,
                overall_pass,
                overall_pass,
                remedial_allowed,
                certified,
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Auto-generated BLS result for user %', user_id_val;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Function to auto-update comments when BLS result is created/updated
CREATE OR REPLACE FUNCTION auto_update_bls_comments()
RETURNS TRIGGER AS $$
DECLARE
    comments_text TEXT;
    user_id_val UUID;
    checklist_data RECORD;
    station_name TEXT;
    performed_count INTEGER;
    total_count INTEGER;
    percentage INTEGER;
BEGIN
    user_id_val := NEW.user_id;
    
    -- Generate comments based on checklist data
    comments_text := '=== BLS ASSESSMENT DETAILED ANALYSIS ===' || E'\n';
    comments_text := comments_text || 'Assessment Date: ' || TO_CHAR(NOW(), 'MM/DD/YYYY') || E'\n';
    comments_text := comments_text || 'User ID: ' || user_id_val || E'\n\n';
    
    -- Add performance summary
    comments_text := comments_text || 'PERFORMANCE SUMMARY:' || E'\n';
    
    -- Analyze each station
    FOR checklist_data IN 
        SELECT checklist_type, checklist_details
        FROM checklist_results
        WHERE user_id = user_id_val
        ORDER BY checklist_type
    LOOP
        station_name := INITCAP(REPLACE(checklist_data.checklist_type, '-', ' '));
        
        IF checklist_data.checklist_details IS NOT NULL THEN
            performed_count := (
                SELECT COUNT(*)
                FROM jsonb_each(checklist_data.checklist_details)
                WHERE (value->>'completed')::boolean = true
            );
            
            total_count := (
                SELECT COUNT(*)
                FROM jsonb_each(checklist_data.checklist_details)
            );
            
            percentage := CASE 
                WHEN total_count > 0 THEN ROUND((performed_count::float / total_count) * 100)
                ELSE 0
            END;
            
            comments_text := comments_text || '• ' || station_name || ': ' || 
                CASE WHEN percentage >= 70 THEN 'PASS' ELSE 'FAIL' END || 
                ' (' || performed_count || '/' || total_count || ')' || E'\n';
        END IF;
    END LOOP;
    
    comments_text := comments_text || E'\n';
    comments_text := comments_text || '=== OVERALL ASSESSMENT ===' || E'\n';
    comments_text := comments_text || 'Assessment completed: ' || TO_CHAR(NOW(), 'MM/DD/YYYY HH24:MI:SS') || E'\n';
    
    -- Update the comments
    NEW.comments := comments_text;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create triggers
DROP TRIGGER IF EXISTS trigger_auto_generate_bls_result ON checklist_results;
CREATE TRIGGER trigger_auto_generate_bls_result
    AFTER INSERT OR UPDATE ON checklist_results
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_bls_result();

DROP TRIGGER IF EXISTS trigger_auto_update_bls_comments ON bls_results;
CREATE TRIGGER trigger_auto_update_bls_comments
    BEFORE INSERT OR UPDATE ON bls_results
    FOR EACH ROW
    EXECUTE FUNCTION auto_update_bls_comments();

-- 4. Create function to manually sync existing data
CREATE OR REPLACE FUNCTION sync_existing_data()
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- For each user with complete checklist data, ensure BLS result exists
    FOR user_record IN
        SELECT user_id, COUNT(*) as checklist_count
        FROM checklist_results
        GROUP BY user_id
        HAVING COUNT(*) = 5
    LOOP
        -- Check if BLS result exists
        IF NOT EXISTS (SELECT 1 FROM bls_results WHERE user_id = user_record.user_id) THEN
            -- Trigger the auto-generation
            PERFORM auto_generate_bls_result();
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Sync completed for existing data';
END;
$$ LANGUAGE plpgsql;

-- 5. Add comments to functions
COMMENT ON FUNCTION auto_generate_bls_result() IS 'Automatically generates BLS results when all 5 checklist results exist for a user';
COMMENT ON FUNCTION auto_update_bls_comments() IS 'Automatically updates comments when BLS results are created or updated';
COMMENT ON FUNCTION sync_existing_data() IS 'Manually syncs existing data to ensure all users have BLS results';
