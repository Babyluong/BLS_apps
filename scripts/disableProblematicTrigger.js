// scripts/disableProblematicTrigger.js
// Disable the trigger that's causing the recalculate_scores_for_question error

import { createClient } from '@supabase/supabase-js';

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function disableProblematicTrigger() {
  console.log('🔧 Disabling problematic trigger...');
  
  try {
    // Disable the trigger that calls the missing function
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
    console.log('📋 This will prevent the recalculate_scores_for_question error');
    console.log('📋 The app will now handle score recalculation manually');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to disable trigger:', error);
    return false;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  disableProblematicTrigger()
    .then(success => {
      if (success) {
        console.log('🎉 Problematic trigger disabled successfully!');
        console.log('📋 You can now edit questions without the error');
        console.log('📋 Score recalculation will still work via the app');
      } else {
        console.log('❌ Failed to disable trigger');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default disableProblematicTrigger;
