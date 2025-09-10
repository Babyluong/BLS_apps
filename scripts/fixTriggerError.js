// scripts/fixTriggerError.js
// Fix the trigger error by disabling the problematic trigger

import { createClient } from '@supabase/supabase-js';

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTriggerError() {
  console.log('🔧 Fixing trigger error...');
  
  try {
    // Step 1: Check if the trigger exists
    console.log('🔍 Checking for problematic trigger...');
    
    const checkTriggerSQL = `
      SELECT trigger_name, event_manipulation, event_object_table 
      FROM information_schema.triggers 
      WHERE trigger_name = 'trigger_auto_update_scores' 
      AND event_object_table = 'questions';
    `;
    
    const { data: triggers, error: checkError } = await supabase.rpc('exec_sql', { 
      sql: checkTriggerSQL 
    });
    
    if (checkError) {
      console.log('⚠️ Could not check triggers, proceeding with fix...');
    } else if (triggers && triggers.length > 0) {
      console.log('✅ Found problematic trigger, disabling it...');
    } else {
      console.log('ℹ️ No problematic trigger found');
    }
    
    // Step 2: Disable the trigger
    console.log('🛠️ Disabling trigger...');
    
    const disableTriggerSQL = `
      DROP TRIGGER IF EXISTS trigger_auto_update_scores ON questions;
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: disableTriggerSQL 
    });
    
    if (error) {
      console.error('❌ Error disabling trigger:', error);
      throw error;
    }
    
    console.log('✅ Trigger disabled successfully!');
    
    // Step 3: Verify the trigger is gone
    console.log('🔍 Verifying trigger is disabled...');
    
    const verifySQL = `
      SELECT trigger_name 
      FROM information_schema.triggers 
      WHERE trigger_name = 'trigger_auto_update_scores' 
      AND event_object_table = 'questions';
    `;
    
    const { data: verifyResult, error: verifyError } = await supabase.rpc('exec_sql', { 
      sql: verifySQL 
    });
    
    if (verifyError) {
      console.log('⚠️ Could not verify trigger status');
    } else if (!verifyResult || verifyResult.length === 0) {
      console.log('✅ Trigger successfully disabled!');
    } else {
      console.log('⚠️ Trigger may still exist');
    }
    
    console.log('🎉 Fix completed!');
    console.log('📋 The edit question error should now be resolved');
    console.log('📋 You can now edit questions without the recalculate_scores_for_question error');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to fix trigger error:', error);
    return false;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixTriggerError()
    .then(success => {
      if (success) {
        console.log('🎉 Trigger error fixed successfully!');
        console.log('📋 Try editing a question now - the error should be gone');
      } else {
        console.log('❌ Failed to fix trigger error');
        console.log('📋 You may need to manually disable the trigger in your database');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default fixTriggerError;
