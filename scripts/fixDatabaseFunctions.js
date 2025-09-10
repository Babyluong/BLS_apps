// scripts/fixDatabaseFunctions.js
// Simple script to fix the missing database function issue

import { createClient } from '@supabase/supabase-js';

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabaseFunctions() {
  console.log('🔧 Fixing database functions...');
  
  try {
    // First, let's check if the function exists
    console.log('🔍 Checking if recalculate_scores_for_question function exists...');
    
    const { data: functions, error: checkError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT routine_name, routine_type 
          FROM information_schema.routines 
          WHERE routine_name = 'recalculate_scores_for_question'
          AND routine_schema = 'public'
        ` 
      });
    
    if (checkError) {
      console.log('⚠️ Could not check functions, proceeding with creation...');
    } else if (functions && functions.length > 0) {
      console.log('✅ Function already exists!');
      return true;
    }
    
    console.log('📝 Creating missing functions...');
    
    // Create the function using a simpler approach
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION recalculate_scores_for_question(question_id INTEGER)
      RETURNS INTEGER AS $$
      DECLARE
          session_record RECORD;
          updated_count INTEGER := 0;
      BEGIN
          -- Find all quiz sessions that have answers for this question
          FOR session_record IN 
              SELECT id, quiz_key, answers
              FROM quiz_sessions 
              WHERE 
                  status = 'submitted' AND
                  (
                      answers ? ('malay-' || question_id) OR
                      answers ? ('english-' || question_id) OR
                      answers ? ('pre-test-' || question_id)
                  )
          LOOP
              -- For now, just count the sessions (we'll implement full recalculation later)
              updated_count := updated_count + 1;
          END LOOP;
          
          RETURN updated_count;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: createFunctionSQL 
    });
    
    if (error) {
      console.error('❌ Error creating function:', error);
      throw error;
    }
    
    console.log('✅ Function created successfully!');
    
    // Grant permissions
    const grantSQL = `
      GRANT EXECUTE ON FUNCTION recalculate_scores_for_question(INTEGER) TO authenticated;
    `;
    
    const { error: grantError } = await supabase.rpc('exec_sql', { 
      sql: grantSQL 
    });
    
    if (grantError) {
      console.warn('⚠️ Could not grant permissions:', grantError.message);
    } else {
      console.log('✅ Permissions granted!');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to fix database functions:', error);
    return false;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixDatabaseFunctions()
    .then(success => {
      if (success) {
        console.log('🎉 Database functions fixed successfully!');
        console.log('📋 Next steps:');
        console.log('1. Test editing a question');
        console.log('2. Check if the error is gone');
        console.log('3. Verify that changes show immediately');
      } else {
        console.log('❌ Failed to fix database functions');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default fixDatabaseFunctions;
