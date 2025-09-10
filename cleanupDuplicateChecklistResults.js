// cleanupDuplicateChecklistResults.js - Remove duplicate checklist results, keeping only the best/most recent
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupDuplicateChecklistResults() {
  console.log('🧹 Cleaning up duplicate checklist results...\n');

  try {
    // Get all checklist results
    console.log('1. Fetching all checklist results...');
    const { data: allResults, error: fetchError } = await supabase
      .from('checklist_results')
      .select('*')
      .order('user_id, checklist_type, created_at');

    if (fetchError) {
      console.error('❌ Error fetching results:', fetchError);
      return;
    }

    console.log(`Total checklist results: ${allResults.length}`);
    console.log('');

    // Group by user_id and checklist_type
    console.log('2. Grouping results by participant and checklist type...');
    const groupedResults = {};
    
    allResults.forEach(result => {
      const key = `${result.user_id}-${result.checklist_type}`;
      if (!groupedResults[key]) {
        groupedResults[key] = [];
      }
      groupedResults[key].push(result);
    });

    console.log(`Found ${Object.keys(groupedResults).length} unique participant-checklist combinations`);
    console.log('');

    // Find duplicates and decide which to keep
    console.log('3. Identifying duplicates and selecting best records...');
    const recordsToDelete = [];
    const recordsToKeep = [];

    Object.entries(groupedResults).forEach(([key, results]) => {
      if (results.length > 1) {
        console.log(`Duplicate found for ${key}: ${results.length} entries`);
        
        // Sort by score (descending) then by created_at (descending)
        // Keep the highest score, or if tied, the most recent
        const sortedResults = results.sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score; // Higher score first
          }
          return new Date(b.created_at) - new Date(a.created_at); // More recent first
        });

        const keepRecord = sortedResults[0];
        const deleteRecords = sortedResults.slice(1);

        recordsToKeep.push(keepRecord);
        recordsToDelete.push(...deleteRecords);

        console.log(`  Keeping: ID ${keepRecord.id} (Score: ${keepRecord.score}, Created: ${keepRecord.created_at})`);
        deleteRecords.forEach(record => {
          console.log(`  Deleting: ID ${record.id} (Score: ${record.score}, Created: ${record.created_at})`);
        });
        console.log('');
      } else {
        recordsToKeep.push(results[0]);
      }
    });

    console.log(`Records to keep: ${recordsToKeep.length}`);
    console.log(`Records to delete: ${recordsToDelete.length}`);
    console.log('');

    // Delete duplicate records
    console.log('4. Deleting duplicate records...');
    let deletedCount = 0;
    let errorCount = 0;

    for (const record of recordsToDelete) {
      try {
        const { error: deleteError } = await supabase
          .from('checklist_results')
          .delete()
          .eq('id', record.id);

        if (deleteError) {
          console.error(`❌ Error deleting record ${record.id}:`, deleteError.message);
          errorCount++;
        } else {
          deletedCount++;
          if (deletedCount % 10 === 0) {
            console.log(`Deleted ${deletedCount} records...`);
          }
        }
      } catch (error) {
        console.error(`❌ Error deleting record ${record.id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n✅ Deletion complete: ${deletedCount} records deleted, ${errorCount} errors`);
    console.log('');

    // Verify the cleanup
    console.log('5. Verifying cleanup...');
    const { count: finalCount, error: finalCountError } = await supabase
      .from('checklist_results')
      .select('*', { count: 'exact', head: true });

    if (finalCountError) {
      console.error('❌ Error counting final results:', finalCountError);
    } else {
      console.log(`Final checklist results count: ${finalCount}`);
    }

    // Check unique participants
    const { data: finalResults, error: finalError } = await supabase
      .from('checklist_results')
      .select('user_id')
      .not('user_id', 'is', null);

    if (finalError) {
      console.error('❌ Error getting final results:', finalError);
    } else {
      const uniqueUserIds = [...new Set(finalResults.map(r => r.user_id))];
      console.log(`Unique participants: ${uniqueUserIds.length}`);
      console.log(`Average results per participant: ${(finalCount / uniqueUserIds.length).toFixed(2)}`);
    }

    // Check for remaining duplicates
    console.log('\n6. Checking for remaining duplicates...');
    const { data: remainingResults, error: remainingError } = await supabase
      .from('checklist_results')
      .select('user_id, checklist_type')
      .not('user_id', 'is', null)
      .not('checklist_type', 'is', null);

    if (remainingError) {
      console.error('❌ Error checking remaining results:', remainingError);
    } else {
      const combinationCounts = {};
      remainingResults.forEach(result => {
        const key = `${result.user_id}-${result.checklist_type}`;
        combinationCounts[key] = (combinationCounts[key] || 0) + 1;
      });

      const remainingDuplicates = Object.entries(combinationCounts).filter(([key, count]) => count > 1);
      
      if (remainingDuplicates.length > 0) {
        console.log(`⚠️  Still have ${remainingDuplicates.length} duplicate combinations`);
      } else {
        console.log('✅ No remaining duplicates found');
      }
    }

    // Show sample of cleaned data
    console.log('\n7. Sample of cleaned data...');
    const { data: sampleResults, error: sampleError } = await supabase
      .from('checklist_results')
      .select('user_id, participant_name, checklist_type, score, status, created_at')
      .limit(10)
      .order('user_id, checklist_type');

    if (sampleError) {
      console.error('❌ Error getting sample results:', sampleError);
    } else {
      console.log('Sample cleaned results:');
      sampleResults.forEach((result, index) => {
        console.log(`${index + 1}. ${result.participant_name} - ${result.checklist_type}: ${result.score}/10 (${result.status})`);
      });
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
cleanupDuplicateChecklistResults();

