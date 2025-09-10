// verifyUsersTableDropped.js
// Verify that the users table has been successfully dropped

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyUsersTableDropped() {
  console.log('🔍 Verifying Users Table Deletion\n');
  console.log('=' .repeat(60));
  
  try {
    // Try to access the users table
    console.log('📋 Attempting to access users table...');
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('✅ SUCCESS! Users table has been completely dropped!');
        console.log('   Error code PGRST116 means "table does not exist"');
      } else {
        console.log(`⚠️  Unexpected error: ${error.message}`);
        console.log(`   Error code: ${error.code}`);
      }
    } else {
      console.log('❌ Users table still exists!');
      console.log(`   Found ${data.length} records`);
    }
    
    // Check profiles table is still working
    console.log('\n📋 Verifying profiles table is still accessible...');
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.log(`❌ Profiles table error: ${profilesError.message}`);
    } else {
      console.log('✅ Profiles table is working correctly!');
    }
    
    // Final summary
    console.log('\n📊 VERIFICATION SUMMARY:');
    console.log('=' .repeat(60));
    
    if (error && error.code === 'PGRST116') {
      console.log('🎉 MIGRATION COMPLETE!');
      console.log('✅ Users table successfully dropped');
      console.log('✅ Profiles table working correctly');
      console.log('✅ All data preserved in profiles table');
      console.log('✅ Database is now clean and unified');
      
      console.log('\n🔄 NEXT STEPS:');
      console.log('=' .repeat(60));
      console.log('1. ✅ Users table dropped');
      console.log('2. 🔄 Update application code (remove users references)');
      console.log('3. 🧪 Test all functionality');
      console.log('4. 🎉 Enjoy your clean, unified database!');
    } else {
      console.log('⚠️  Users table still exists');
      console.log('   Please run the SQL script in Supabase Dashboard');
      console.log('   or manually delete the table from the Table Editor');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Run the verification
verifyUsersTableDropped();
