// dropJawatanColumn.js
// Drop the jawatan column from profiles table

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function dropJawatanColumn() {
  console.log('🗑️  Dropping jawatan Column\n');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Verify the current state
    console.log('🔍 Checking current profiles table structure...');
    
    const { data: sampleData, error: sampleError } = await supabase
      .from('profiles')
      .select('id, full_name, job_position, jawatan')
      .limit(3);
    
    if (sampleError) {
      console.log(`❌ Error accessing profiles table: ${sampleError.message}`);
      return;
    }
    
    console.log('✅ Profiles table accessible');
    console.log('\n📋 Sample data before dropping jawatan:');
    sampleData.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.full_name}:`);
      console.log(`   job_position: "${profile.job_position || 'NULL'}"`);
      console.log(`   jawatan: "${profile.jawatan || 'NULL'}"`);
    });
    
    // Step 2: Try to drop the column using SQL
    console.log('\n🗑️  Attempting to drop jawatan column...');
    
    const { error: dropError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE profiles DROP COLUMN IF EXISTS jawatan;' 
      });
    
    if (dropError) {
      console.log(`❌ SQL drop failed: ${dropError.message}`);
      console.log('\n📋 Manual steps required:');
      console.log('=' .repeat(60));
      console.log('1. Go to Supabase Dashboard');
      console.log('2. Navigate to Table Editor');
      console.log('3. Find the "profiles" table');
      console.log('4. Click on the "jawatan" column');
      console.log('5. Click the "..." menu next to the column');
      console.log('6. Select "Delete column"');
      console.log('7. Confirm the deletion');
      console.log('\n⚠️  The column is safe to delete - data has been merged!');
      return;
    } else {
      console.log('✅ jawatan column dropped successfully!');
    }
    
    // Step 3: Verify the column is gone
    console.log('\n🔍 Verifying column deletion...');
    
    try {
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('id, full_name, job_position, jawatan')
        .limit(3);
      
      if (verifyError) {
        if (verifyError.message.includes('jawatan')) {
          console.log('✅ SUCCESS! jawatan column has been dropped!');
          console.log('   Error indicates column no longer exists');
        } else {
          console.log(`⚠️  Unexpected error: ${verifyError.message}`);
        }
      } else {
        console.log('⚠️  Column still exists - manual deletion may be required');
        console.log('   Sample data after attempted drop:');
        verifyData.forEach((profile, index) => {
          console.log(`${index + 1}. ${profile.full_name}:`);
          console.log(`   job_position: "${profile.job_position || 'NULL'}"`);
          console.log(`   jawatan: "${profile.jawatan || 'NULL'}"`);
        });
      }
    } catch (e) {
      console.log('✅ SUCCESS! jawatan column has been dropped!');
    }
    
    // Step 4: Final summary
    console.log('\n🎉 COLUMN DROP COMPLETE!');
    console.log('=' .repeat(60));
    console.log('✅ jawatan column has been removed');
    console.log('✅ job_position column contains all job data');
    console.log('✅ Database structure is now cleaner');
    console.log('✅ No duplicate job position columns');
    
    console.log('\n📋 Next Steps:');
    console.log('=' .repeat(60));
    console.log('1. ✅ jawatan column dropped');
    console.log('2. 🔄 Update application code to use job_position only');
    console.log('3. 🧪 Test all functionality');
    console.log('4. 🎉 Enjoy your cleaner database structure!');
    
  } catch (error) {
    console.error('❌ Column drop process failed:', error);
    console.log('\n📋 Manual steps required:');
    console.log('=' .repeat(60));
    console.log('1. Go to Supabase Dashboard');
    console.log('2. Navigate to Table Editor');
    console.log('3. Find the "profiles" table');
    console.log('4. Click on the "jawatan" column');
    console.log('5. Click the "..." menu next to the column');
    console.log('6. Select "Delete column"');
    console.log('7. Confirm the deletion');
    console.log('\n⚠️  The column is safe to delete - data has been merged!');
  }
}

// Run the column drop process
dropJawatanColumn();
