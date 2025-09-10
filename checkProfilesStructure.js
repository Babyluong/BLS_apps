// checkProfilesStructure.js - Check the structure of profiles table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfilesStructure() {
  console.log('🔍 Checking profiles table structure...\n');

  try {
    // Get a sample record to see the structure
    console.log('1. Getting sample profiles data...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('❌ Error getting sample data:', sampleError);
      return;
    }

    if (sampleData && sampleData.length > 0) {
      console.log('✅ Sample profiles record:');
      console.log(JSON.stringify(sampleData[0], null, 2));
      console.log('');
      
      console.log('📋 Available columns:');
      Object.keys(sampleData[0]).forEach((key, index) => {
        console.log(`   ${index + 1}. ${key}: ${typeof sampleData[0][key]} = ${sampleData[0][key]}`);
      });
    } else {
      console.log('ℹ️  No data found in profiles table');
    }

    // Get count of total records
    console.log('\n2. Getting total count...');
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error getting count:', countError);
    } else {
      console.log(`📊 Total profiles records: ${count}`);
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
checkProfilesStructure();

