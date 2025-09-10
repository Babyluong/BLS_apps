// investigateChecklistResults.js - Investigate why checklist_results has 10 results per participant
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigateChecklistResults() {
  console.log('🔍 Investigating checklist_results table structure...\n');

  try {
    // Get total count of checklist results
    console.log('1. Getting total checklist results count...');
    const { count: totalCount, error: countError } = await supabase
      .from('checklist_results')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting checklist results:', countError);
      return;
    }

    console.log(`Total checklist results: ${totalCount}`);
    console.log('');

    // Get unique participants count
    console.log('2. Getting unique participants count...');
    const { data: uniqueParticipants, error: uniqueError } = await supabase
      .from('checklist_results')
      .select('user_id')
      .not('user_id', 'is', null);

    if (uniqueError) {
      console.error('❌ Error getting unique participants:', uniqueError);
      return;
    }

    const uniqueUserIds = [...new Set(uniqueParticipants.map(r => r.user_id))];
    console.log(`Unique participants: ${uniqueUserIds.length}`);
    console.log(`Average results per participant: ${(totalCount / uniqueUserIds.length).toFixed(2)}`);
    console.log('');

    // Check what checklist types exist
    console.log('3. Checking checklist types...');
    const { data: checklistTypes, error: typesError } = await supabase
      .from('checklist_results')
      .select('checklist_type')
      .not('checklist_type', 'is', null);

    if (typesError) {
      console.error('❌ Error getting checklist types:', typesError);
      return;
    }

    const uniqueTypes = [...new Set(checklistTypes.map(r => r.checklist_type))];
    console.log(`Unique checklist types: ${uniqueTypes.length}`);
    uniqueTypes.forEach((type, index) => {
      console.log(`${index + 1}. ${type}`);
    });
    console.log('');

    // Count results per type
    console.log('4. Counting results per checklist type...');
    for (const type of uniqueTypes) {
      const { count: typeCount, error: typeCountError } = await supabase
        .from('checklist_results')
        .select('*', { count: 'exact', head: true })
        .eq('checklist_type', type);

      if (typeCountError) {
        console.error(`❌ Error counting ${type}:`, typeCountError);
      } else {
        console.log(`${type}: ${typeCount} results`);
      }
    }
    console.log('');

    // Check a specific participant's results
    console.log('5. Checking a specific participant\'s results...');
    const sampleUserId = uniqueUserIds[0];
    const { data: sampleResults, error: sampleError } = await supabase
      .from('checklist_results')
      .select('id, user_id, participant_name, participant_ic, checklist_type, passed, created_at, updated_at')
      .eq('user_id', sampleUserId)
      .order('created_at');

    if (sampleError) {
      console.error('❌ Error getting sample results:', sampleError);
      return;
    }

    console.log(`Sample participant (${sampleUserId}):`);
    console.log(`Total results: ${sampleResults.length}`);
    console.log('');
    
    sampleResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.checklist_type} - ${result.passed ? 'PASS' : 'FAIL'} (${result.created_at})`);
    });
    console.log('');

    // Check for duplicate results (same user + same checklist_type)
    console.log('6. Checking for duplicate results...');
    const { data: duplicates, error: duplicateError } = await supabase
      .from('checklist_results')
      .select('user_id, checklist_type')
      .not('user_id', 'is', null)
      .not('checklist_type', 'is', null);

    if (duplicateError) {
      console.error('❌ Error checking duplicates:', duplicateError);
      return;
    }

    // Count occurrences of each user_id + checklist_type combination
    const combinationCounts = {};
    duplicates.forEach(result => {
      const key = `${result.user_id}-${result.checklist_type}`;
      combinationCounts[key] = (combinationCounts[key] || 0) + 1;
    });

    const duplicateCombinations = Object.entries(combinationCounts).filter(([key, count]) => count > 1);
    
    if (duplicateCombinations.length > 0) {
      console.log(`⚠️  Found ${duplicateCombinations.length} duplicate combinations:`);
      duplicateCombinations.slice(0, 10).forEach(([key, count]) => {
        const [userId, checklistType] = key.split('-');
        console.log(`- User ${userId}: ${checklistType} (${count} times)`);
      });
      if (duplicateCombinations.length > 10) {
        console.log(`... and ${duplicateCombinations.length - 10} more`);
      }
    } else {
      console.log('✅ No duplicate combinations found');
    }
    console.log('');

    // Check if there are multiple entries per participant per checklist type
    console.log('7. Checking entries per participant per checklist type...');
    const participantChecklistCounts = {};
    
    for (const userId of uniqueUserIds.slice(0, 5)) { // Check first 5 participants
      const { data: userResults, error: userError } = await supabase
        .from('checklist_results')
        .select('checklist_type, created_at')
        .eq('user_id', userId)
        .order('created_at');

      if (userError) {
        console.error(`❌ Error getting results for user ${userId}:`, userError);
        continue;
      }

      const typeCounts = {};
      userResults.forEach(result => {
        typeCounts[result.checklist_type] = (typeCounts[result.checklist_type] || 0) + 1;
      });

      participantChecklistCounts[userId] = typeCounts;
    }

    console.log('Sample participant breakdown:');
    Object.entries(participantChecklistCounts).forEach(([userId, typeCounts]) => {
      console.log(`User ${userId}:`);
      Object.entries(typeCounts).forEach(([type, count]) => {
        console.log(`  ${type}: ${count} entries`);
      });
      console.log('');
    });

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
investigateChecklistResults();

