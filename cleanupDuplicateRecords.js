// cleanupDuplicateRecords.js
// Clean up duplicate records in bls_results table

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupDuplicateRecords() {
  try {
    console.log('🧹 Cleaning up duplicate records in bls_results...\n');

    // Get all records from bls_results
    const { data: allRecords, error } = await supabase
      .from('bls_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('❌ Error fetching records:', error.message);
      return;
    }

    console.log(`Total records: ${allRecords.length}`);

    // Group by user_id to find duplicates
    const userGroups = {};
    allRecords.forEach(record => {
      if (!userGroups[record.user_id]) {
        userGroups[record.user_id] = [];
      }
      userGroups[record.user_id].push(record);
    });

    // Find users with multiple records
    const duplicateUsers = Object.entries(userGroups).filter(([userId, records]) => records.length > 1);
    
    console.log(`Unique users: ${Object.keys(userGroups).length}`);
    console.log(`Users with duplicates: ${duplicateUsers.length}`);

    if (duplicateUsers.length === 0) {
      console.log('✅ No duplicates found. Database is clean!');
      return;
    }

    // Clean up duplicates for each user
    let totalDeleted = 0;
    
    for (const [userId, records] of duplicateUsers) {
      console.log(`\n🔍 Processing user: ${userId}`);
      console.log(`  Records: ${records.length}`);
      
      // Sort records by created_at (newest first)
      records.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      // Keep the first (newest) record, delete the rest
      const keepRecord = records[0];
      const deleteRecords = records.slice(1);
      
      console.log(`  Keeping: ${keepRecord.id} (${keepRecord.created_at})`);
      console.log(`  Deleting: ${deleteRecords.length} records`);
      
      // Delete duplicate records
      for (const record of deleteRecords) {
        const { error: deleteError } = await supabase
          .from('bls_results')
          .delete()
          .eq('id', record.id);
        
        if (deleteError) {
          console.log(`    ❌ Error deleting ${record.id}: ${deleteError.message}`);
        } else {
          console.log(`    ✅ Deleted ${record.id}`);
          totalDeleted++;
        }
      }
    }

    console.log(`\n📊 Cleanup Summary:`);
    console.log(`- Total records before: ${allRecords.length}`);
    console.log(`- Records deleted: ${totalDeleted}`);
    console.log(`- Expected final count: ${allRecords.length - totalDeleted}`);

    // Verify the cleanup
    console.log('\n🔍 Verifying cleanup...');
    const { data: finalRecords, error: finalError } = await supabase
      .from('bls_results')
      .select('user_id')
      .order('created_at', { ascending: false });

    if (finalError) {
      console.log('❌ Error verifying cleanup:', finalError.message);
      return;
    }

    const uniqueUsers = new Set(finalRecords.map(r => r.user_id));
    console.log(`✅ Final verification:`);
    console.log(`- Total records: ${finalRecords.length}`);
    console.log(`- Unique users: ${uniqueUsers.size}`);
    
    if (finalRecords.length === uniqueUsers.size) {
      console.log('🎉 Cleanup successful! Each user now has exactly one record.');
    } else {
      console.log('⚠️ Warning: Still have duplicates or missing records.');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

cleanupDuplicateRecords();

