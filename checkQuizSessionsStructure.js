// checkQuizSessionsStructure.js
// Check the actual structure of quiz_sessions table

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E'
);

async function checkQuizSessionsStructure() {
  try {
    console.log('🔍 Checking quiz_sessions table structure...\n');
    
    // Get a sample record to see the actual structure
    const { data: sample, error: sampleError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Error fetching sample from quiz_sessions:', sampleError);
      return;
    }
    
    if (sample && sample.length > 0) {
      console.log('📊 Sample quiz_sessions record:');
      console.log(JSON.stringify(sample[0], null, 2));
      
      console.log('\n📋 Available columns:');
      Object.keys(sample[0]).forEach(column => {
        console.log(`   - ${column}: ${typeof sample[0][column]}`);
      });
    } else {
      console.log('⚠️  No records found in quiz_sessions table');
    }
    
    // Get total count
    const { count, error: countError } = await supabase
      .from('quiz_sessions')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error getting count:', countError);
    } else {
      console.log(`\n📊 Total records in quiz_sessions: ${count}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking quiz_sessions structure:', error);
  }
}

// Run the check
checkQuizSessionsStructure();