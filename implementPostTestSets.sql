-- implementPostTestSets.sql
-- Implement support for 3 post-test sets (A, B, C) in quiz_sessions table

-- 1. Add set_identifier column to quiz_sessions table
ALTER TABLE quiz_sessions ADD COLUMN set_identifier VARCHAR(1);

-- 2. Add comment to describe the column
COMMENT ON COLUMN quiz_sessions.set_identifier IS 'Identifies which post-test set (A, B, C) the user took. NULL for pretest.';

-- 3. Update existing posttest records to have set_identifier = 'A' (default)
UPDATE quiz_sessions 
SET set_identifier = 'A' 
WHERE quiz_key = 'posttest' AND set_identifier IS NULL;

-- 4. Add constraint to ensure valid set identifiers
ALTER TABLE quiz_sessions 
ADD CONSTRAINT check_set_identifier 
CHECK (
    (quiz_key = 'pretest' AND set_identifier IS NULL) OR
    (quiz_key = 'posttest' AND set_identifier IN ('A', 'B', 'C'))
);

-- 5. Create index for better query performance
CREATE INDEX idx_quiz_sessions_set_identifier ON quiz_sessions(quiz_key, set_identifier);

-- 6. Update the auto_generate_bls_result function to handle set_identifier
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
    posttest_set VARCHAR(1);
BEGIN
    -- Get the user_id from the inserted record
    user_id_val := NEW.user_id;
    
    -- Check if all 5 checklist results exist for this user
    SELECT COUNT(*) INTO checklist_count
    FROM checklist_results
    WHERE user_id = user_id_val;
    
    -- Check if pretest exists
    SELECT COUNT(*) INTO quiz_pretest_count
    FROM quiz_sessions
    WHERE user_id = user_id_val AND quiz_key = 'pretest';
    
    -- Check if any posttest exists (any set A, B, or C)
    SELECT COUNT(*) INTO quiz_posttest_count
    FROM quiz_sessions
    WHERE user_id = user_id_val AND quiz_key = 'posttest';
    
    -- Get which posttest set the user took
    SELECT set_identifier INTO posttest_set
    FROM quiz_sessions
    WHERE user_id = user_id_val AND quiz_key = 'posttest'
    LIMIT 1;
    
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
            
            -- Insert BLS result with posttest set information
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
                posttest_set,
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
                posttest_set,
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Auto-generated BLS result for user % (posttest set: %)', user_id_val, posttest_set;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Add posttest_set column to bls_results table
ALTER TABLE bls_results ADD COLUMN posttest_set VARCHAR(1);

-- 8. Add comment to describe the column
COMMENT ON COLUMN bls_results.posttest_set IS 'Which post-test set (A, B, C) the user took for this BLS assessment.';

-- 9. Update existing BLS results to have posttest_set = 'A' (default)
UPDATE bls_results 
SET posttest_set = 'A' 
WHERE posttest_set IS NULL;

-- 10. Add constraint to ensure valid posttest set
ALTER TABLE bls_results 
ADD CONSTRAINT check_posttest_set 
CHECK (posttest_set IN ('A', 'B', 'C'));

-- 11. Update the auto_update_bls_comments function to include posttest set info
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
    posttest_set_info VARCHAR(1);
    pretest_score INTEGER;
    posttest_score INTEGER;
BEGIN
    user_id_val := NEW.user_id;
    posttest_set_info := NEW.posttest_set;
    
    -- Get pretest and posttest scores
    SELECT score INTO pretest_score
    FROM quiz_sessions
    WHERE user_id = user_id_val AND quiz_key = 'pretest'
    LIMIT 1;
    
    SELECT score INTO posttest_score
    FROM quiz_sessions
    WHERE user_id = user_id_val AND quiz_key = 'posttest'
    LIMIT 1;
    
    -- Generate comments based on checklist data
    comments_text := '=== BLS ASSESSMENT DETAILED ANALYSIS ===' || E'\n';
    comments_text := comments_text || 'Assessment Date: ' || TO_CHAR(NOW(), 'MM/DD/YYYY') || E'\n';
    comments_text := comments_text || 'User ID: ' || user_id_val || E'\n';
    comments_text := comments_text || 'Post-Test Set: ' || posttest_set_info || E'\n';
    comments_text := comments_text || 'Pre-Test Score: ' || COALESCE(pretest_score::text, 'N/A') || '/30' || E'\n';
    comments_text := comments_text || 'Post-Test Score: ' || COALESCE(posttest_score::text, 'N/A') || '/30' || E'\n\n';
    
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
    comments_text := comments_text || 'Post-Test Set: ' || posttest_set_info || E'\n';
    comments_text := comments_text || 'Assessment completed: ' || TO_CHAR(NOW(), 'MM/DD/YYYY HH24:MI:SS') || E'\n';
    
    -- Update the comments
    NEW.comments := comments_text;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Create function to get posttest statistics by set
CREATE OR REPLACE FUNCTION get_posttest_statistics()
RETURNS TABLE (
    set_identifier VARCHAR(1),
    total_users BIGINT,
    average_score NUMERIC,
    pass_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qs.set_identifier,
        COUNT(DISTINCT qs.user_id) as total_users,
        ROUND(AVG(qs.score), 2) as average_score,
        ROUND(
            (COUNT(CASE WHEN qs.score >= 21 THEN 1 END)::float / COUNT(*)) * 100, 
            2
        ) as pass_rate
    FROM quiz_sessions qs
    WHERE qs.quiz_key = 'posttest'
    GROUP BY qs.set_identifier
    ORDER BY qs.set_identifier;
END;
$$ LANGUAGE plpgsql;

-- 13. Create function to get user's complete assessment including posttest set
CREATE OR REPLACE FUNCTION get_user_assessment(user_id_param UUID)
RETURNS TABLE (
    assessment_type TEXT,
    set_identifier VARCHAR(1),
    score INTEGER,
    total_questions INTEGER,
    percentage NUMERIC,
    completed_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qs.quiz_key as assessment_type,
        qs.set_identifier,
        qs.score,
        qs.total_questions,
        ROUND((qs.score::float / qs.total_questions) * 100, 2) as percentage,
        qs.started_at as completed_at
    FROM quiz_sessions qs
    WHERE qs.user_id = user_id_param
    ORDER BY qs.started_at;
END;
$$ LANGUAGE plpgsql;

-- 14. Add comments to new functions
COMMENT ON FUNCTION get_posttest_statistics() IS 'Get statistics for each post-test set (A, B, C)';
COMMENT ON FUNCTION get_user_assessment(UUID) IS 'Get complete assessment history for a specific user including posttest set';

-- 15. Create view for easy querying of posttest sets
CREATE OR REPLACE VIEW posttest_sets_summary AS
SELECT 
    qs.set_identifier,
    COUNT(DISTINCT qs.user_id) as total_users,
    ROUND(AVG(qs.score), 2) as average_score,
    ROUND(
        (COUNT(CASE WHEN qs.score >= 21 THEN 1 END)::float / COUNT(*)) * 100, 
        2
    ) as pass_rate,
    MIN(qs.started_at) as first_assessment,
    MAX(qs.started_at) as latest_assessment
FROM quiz_sessions qs
WHERE qs.quiz_key = 'posttest'
GROUP BY qs.set_identifier
ORDER BY qs.set_identifier;

COMMENT ON VIEW posttest_sets_summary IS 'Summary statistics for each post-test set (A, B, C)';
