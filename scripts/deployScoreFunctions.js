// scripts/deployScoreFunctions.js
// Deploy the missing recalculate_scores_for_question function to the database

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables or use hardcoded values
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deployScoreFunctions() {
  console.log('🚀 Deploying score calculation functions...');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'database', 'auto_score_update.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 SQL file loaded, executing...');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: sqlContent 
    });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      throw error;
    }
    
    console.log('✅ Score calculation functions deployed successfully!');
    console.log('📊 Functions available:');
    console.log('  - recalculate_quiz_score(UUID)');
    console.log('  - recalculate_scores_for_question(INTEGER)');
    console.log('  - recalculate_all_quiz_scores()');
    console.log('  - admin_recalculate_all_scores()');
    console.log('  - get_score_update_stats()');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to deploy functions:', error);
    return false;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  deployScoreFunctions()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default deployScoreFunctions;
