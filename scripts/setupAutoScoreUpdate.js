// scripts/setupAutoScoreUpdate.js
// Script to set up automatic score update system

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAutoScoreUpdate() {
  console.log('🚀 Setting up automatic score update system...');
  
  try {
    // Authenticate as admin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: '940120126733@hospital-lawas.local',
      password: '940120126733'
    });
    
    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      return;
    }
    
    console.log('✅ Authenticated successfully');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'database', 'auto_score_update.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Read SQL file:', sqlPath);
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim() === '') continue;
      
      try {
        console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}...`);
        console.log(`SQL: ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Exception in statement ${i + 1}:`, err.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Setup Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Automatic score update system setup completed successfully!');
      console.log('\nFeatures installed:');
      console.log('• Automatic score recalculation when correct answers change');
      console.log('• Manual score recalculation functions');
      console.log('• Score update statistics and monitoring');
      console.log('• Activity logging for score updates');
      
      console.log('\nNext steps:');
      console.log('1. Test the system by changing a correct answer in the questions table');
      console.log('2. Use the admin tools to manually recalculate scores if needed');
      console.log('3. Monitor the activity logs for score update events');
    } else {
      console.log('\n⚠️ Setup completed with errors. Please check the error messages above.');
    }
    
  } catch (err) {
    console.error('❌ Setup failed:', err);
  }
}

// Alternative method using direct SQL execution
async function setupAutoScoreUpdateDirect() {
  console.log('🚀 Setting up automatic score update system (direct method)...');
  
  try {
    // Authenticate as admin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: '940120126733@hospital-lawas.local',
      password: '940120126733'
    });
    
    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      return;
    }
    
    console.log('✅ Authenticated successfully');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'database', 'auto_score_update.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Read SQL file:', sqlPath);
    
    // Execute the entire SQL script
    console.log('🔄 Executing SQL script...');
    
    const { error } = await supabase.rpc('exec', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Error executing SQL:', error.message);
      return;
    }
    
    console.log('✅ SQL script executed successfully');
    console.log('\n🎉 Automatic score update system setup completed!');
    
  } catch (err) {
    console.error('❌ Setup failed:', err);
  }
}

// Test the setup
async function testSetup() {
  console.log('🧪 Testing automatic score update system...');
  
  try {
    // Test the health check
    const { data: stats, error } = await supabase.rpc('get_score_update_stats');
    
    if (error) {
      console.error('❌ Health check failed:', error.message);
      return;
    }
    
    console.log('✅ Health check passed');
    console.log('📊 System stats:', stats);
    
    // Test manual recalculation
    console.log('🔄 Testing manual score recalculation...');
    const { data: result, error: recalcError } = await supabase.rpc('admin_recalculate_all_scores');
    
    if (recalcError) {
      console.error('❌ Manual recalculation failed:', recalcError.message);
      return;
    }
    
    console.log('✅ Manual recalculation test passed');
    console.log('📊 Recalculation result:', result);
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

// Main execution
if (require.main === module) {
  const command = process.argv[2] || 'setup';
  
  switch (command) {
    case 'setup':
      setupAutoScoreUpdate();
      break;
    case 'setup-direct':
      setupAutoScoreUpdateDirect();
      break;
    case 'test':
      testSetup();
      break;
    default:
      console.log('Usage: node setupAutoScoreUpdate.js [setup|setup-direct|test]');
      console.log('  setup: Set up the system (default)');
      console.log('  setup-direct: Set up using direct SQL execution');
      console.log('  test: Test the setup');
  }
}

module.exports = { setupAutoScoreUpdate, setupAutoScoreUpdateDirect, testSetup };
