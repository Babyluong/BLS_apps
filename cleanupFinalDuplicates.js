// cleanupFinalDuplicates.js
// Clean up final duplicates to get exactly 56 records

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupFinalDuplicates() {
  try {
    console.log('🧹 Cleaning up final duplicates to get exactly 56 records...\n');

    // Get all bls_results records
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (blsError) {
      console.log('❌ Error fetching bls_results:', blsError.message);
      return;
    }

    console.log(`📊 Current bls_results: ${blsResults.length} records`);

    // Group by participant_ic to find duplicates
    const icGroups = {};
    blsResults.forEach(record => {
      const ic = record.participant_ic || 'NO_IC';
      if (!icGroups[ic]) {
        icGroups[ic] = [];
      }
      icGroups[ic].push(record);
    });

    const duplicateICs = Object.entries(icGroups).filter(([ic, records]) => records.length > 1);
    
    console.log(`\n🔍 Duplicate ICs found: ${duplicateICs.length}`);
    
    if (duplicateICs.length > 0) {
      console.log(`\n⚠️ Duplicate ICs:`);
      duplicateICs.forEach(([ic, records]) => {
        console.log(`\nIC: ${ic} (${records.length} records)`);
        records.forEach((record, index) => {
          console.log(`  ${index + 1}. User ID: ${record.user_id}`);
          console.log(`     Name: ${record.participant_name || 'N/A'}`);
          console.log(`     Created: ${record.created_at}`);
          console.log(`     Pre-test: ${record.pre_test_score || 'N/A'}`);
          console.log(`     Post-test: ${record.post_test_score || 'N/A'}`);
        });
      });

      // Clean up duplicates - keep the most complete record
      let totalDeleted = 0;
      
      for (const [ic, records] of duplicateICs) {
        console.log(`\n🔧 Cleaning up IC: ${ic}`);
        
        // Sort records by completeness (more data = better)
        records.sort((a, b) => {
          const aScore = (a.pre_test_score || 0) + (a.post_test_score || 0) + 
                        (a.one_man_cpr_pass ? 1 : 0) + (a.two_man_cpr_pass ? 1 : 0) + 
                        (a.adult_choking_pass ? 1 : 0) + (a.infant_choking_pass ? 1 : 0) + 
                        (a.infant_cpr_pass ? 1 : 0);
          const bScore = (b.pre_test_score || 0) + (b.post_test_score || 0) + 
                        (b.one_man_cpr_pass ? 1 : 0) + (b.two_man_cpr_pass ? 1 : 0) + 
                        (b.adult_choking_pass ? 1 : 0) + (b.infant_choking_pass ? 1 : 0) + 
                        (b.infant_cpr_pass ? 1 : 0);
          return bScore - aScore;
        });

        // Keep the first (most complete) record, delete the rest
        const keepRecord = records[0];
        const deleteRecords = records.slice(1);
        
        console.log(`  Keeping: ${keepRecord.id} (most complete)`);
        console.log(`  Deleting: ${deleteRecords.length} records`);
        
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
      console.log(`- Records deleted: ${totalDeleted}`);
      console.log(`- Expected final count: ${blsResults.length - totalDeleted}`);
    }

    // Verify the final result
    console.log(`\n🔍 Final verification...`);
    const { data: finalBlsResults, error: finalError } = await supabase
      .from('bls_results')
      .select('user_id, participant_name, participant_ic')
      .order('created_at', { ascending: false });

    if (finalError) {
      console.log('❌ Error verifying final result:', finalError.message);
      return;
    }

    const uniqueUsers = new Set(finalBlsResults.map(r => r.user_id));
    console.log(`✅ Final verification:`);
    console.log(`- Total bls_results records: ${finalBlsResults.length}`);
    console.log(`- Unique users: ${uniqueUsers.size}`);
    console.log(`- Expected: 56 records`);

    if (finalBlsResults.length === 56) {
      console.log(`🎉 SUCCESS! Now have exactly 56 records for 56 participants.`);
    } else {
      console.log(`⚠️ Still have ${finalBlsResults.length} records instead of 56.`);
    }

    // Show final participant list
    console.log(`\n📋 Final participant list:`);
    finalBlsResults.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.participant_name || 'N/A'} (${record.participant_ic || 'N/A'})`);
    });

  } catch (error) {
    console.error('❌ Error cleaning up duplicates:', error);
  }
}

cleanupFinalDuplicates();

