// fixDuplicateUserID.js - Fix duplicate user_id issue for SHAHRULNIZAM
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDuplicateUserID() {
  console.log('🔧 Fixing duplicate user_id issue for SHAHRULNIZAM...\n');

  try {
    // First, let's examine the duplicate user_ids for SHAHRULNIZAM
    console.log('1. Examining SHAHRULNIZAM records...');
    
    // Check bls_results
    const { data: blsRecords, error: blsError } = await supabase
      .from('bls_results')
      .select('*')
      .eq('participant_ic', '960401135909')
      .eq('participant_name', 'SHAHRULNIZAM BIN IBRAHIM');

    if (blsError) {
      console.error('❌ Error getting bls_results:', blsError);
      return;
    }

    console.log(`bls_results records: ${blsRecords.length}`);
    blsRecords.forEach((record, index) => {
      console.log(`${index + 1}. User ID: ${record.user_id}, Created: ${record.created_at}`);
    });
    console.log('');

    // Check checklist_results
    const { data: checklistRecords, error: checklistError } = await supabase
      .from('checklist_results')
      .select('*')
      .eq('participant_ic', '960401135909')
      .eq('participant_name', 'SHAHRULNIZAM BIN IBRAHIM');

    if (checklistError) {
      console.error('❌ Error getting checklist_results:', checklistError);
      return;
    }

    console.log(`checklist_results records: ${checklistRecords.length}`);
    checklistRecords.forEach((record, index) => {
      console.log(`${index + 1}. User ID: ${record.user_id}, Checklist: ${record.checklist_type}, Created: ${record.created_at}`);
    });
    console.log('');

    // Check profiles
    const { data: profileRecords, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('ic', '960401135909')
      .eq('full_name', 'SHAHRULNIZAM BIN IBRAHIM');

    if (profileError) {
      console.error('❌ Error getting profiles:', profileError);
      return;
    }

    console.log(`profiles records: ${profileRecords.length}`);
    profileRecords.forEach((record, index) => {
      console.log(`${index + 1}. User ID: ${record.id}, Name: ${record.full_name}, IC: ${record.ic}`);
    });
    console.log('');

    // Determine which user_id to keep (the one in bls_results)
    const correctUserId = blsRecords[0]?.user_id;
    const incorrectUserId = checklistRecords[0]?.user_id;

    if (!correctUserId || !incorrectUserId) {
      console.log('❌ Could not identify the correct and incorrect user_ids');
      return;
    }

    console.log(`Correct User ID (from bls_results): ${correctUserId}`);
    console.log(`Incorrect User ID (from checklist_results): ${incorrectUserId}`);
    console.log('');

    // Update checklist_results to use the correct user_id
    console.log('2. Updating checklist_results to use correct user_id...');
    const { error: updateChecklistError } = await supabase
      .from('checklist_results')
      .update({ user_id: correctUserId })
      .eq('user_id', incorrectUserId)
      .eq('participant_ic', '960401135909');

    if (updateChecklistError) {
      console.error('❌ Error updating checklist_results:', updateChecklistError);
      return;
    }

    console.log('✅ Updated checklist_results with correct user_id');
    console.log('');

    // Verify the fix
    console.log('3. Verifying the fix...');
    const { data: updatedChecklistRecords, error: verifyError } = await supabase
      .from('checklist_results')
      .select('user_id, participant_name, participant_ic, checklist_type')
      .eq('participant_ic', '960401135909');

    if (verifyError) {
      console.error('❌ Error verifying checklist_results:', verifyError);
      return;
    }

    console.log(`Updated checklist_results records: ${updatedChecklistRecords.length}`);
    const uniqueUserIds = [...new Set(updatedChecklistRecords.map(r => r.user_id))];
    console.log(`Unique user_ids in checklist_results: ${uniqueUserIds.length}`);
    console.log(`User IDs: ${uniqueUserIds.join(', ')}`);
    console.log('');

    // Check if there are any remaining duplicates
    console.log('4. Checking for remaining duplicates...');
    const { data: allChecklistRecords, error: allChecklistError } = await supabase
      .from('checklist_results')
      .select('user_id, participant_ic, participant_name')
      .not('user_id', 'is', null);

    if (allChecklistError) {
      console.error('❌ Error getting all checklist_results:', allChecklistError);
      return;
    }

    const combinationCounts = {};
    allChecklistRecords.forEach(result => {
      const key = `${result.user_id}-${result.checklist_type}`;
      combinationCounts[key] = (combinationCounts[key] || 0) + 1;
    });

    const remainingDuplicates = Object.entries(combinationCounts).filter(([key, count]) => count > 1);
    
    if (remainingDuplicates.length > 0) {
      console.log(`⚠️  Still have ${remainingDuplicates.length} duplicate combinations`);
    } else {
      console.log('✅ No remaining duplicates found');
    }

    // Final count check
    console.log('\n5. Final count verification...');
    const { count: finalChecklistCount, error: finalCountError } = await supabase
      .from('checklist_results')
      .select('*', { count: 'exact', head: true });

    if (finalCountError) {
      console.error('❌ Error counting final checklist_results:', finalCountError);
      return;
    }

    const { data: finalChecklistUsers, error: finalUsersError } = await supabase
      .from('checklist_results')
      .select('user_id')
      .not('user_id', 'is', null);

    if (finalUsersError) {
      console.error('❌ Error getting final checklist users:', finalUsersError);
      return;
    }

    const finalUniqueUsers = [...new Set(finalChecklistUsers.map(r => r.user_id))];
    console.log(`Final checklist_results count: ${finalChecklistCount}`);
    console.log(`Final unique participants: ${finalUniqueUsers.length}`);
    console.log(`Average results per participant: ${(finalChecklistCount / finalUniqueUsers.length).toFixed(2)}`);

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
fixDuplicateUserID();

