// checkChecklistStructure.js - Check the actual structure of checklist_results table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkChecklistStructure() {
  console.log('🔍 Checking checklist_results table structure...\n');

  try {
    // Get the structure of checklist_results table
    console.log('1. Getting checklist_results table structure...');
    const { data: sampleResults, error: sampleError } = await supabase
      .from('checklist_results')
      .select('*')
      .limit(5);

    if (sampleError) {
      console.error('❌ Error getting sample results:', sampleError);
      return;
    }

    if (sampleResults.length > 0) {
      console.log('Table structure:');
      const columns = Object.keys(sampleResults[0]);
      columns.forEach((column, index) => {
        console.log(`${index + 1}. ${column}`);
      });
      console.log('');

      console.log('Sample data:');
      sampleResults.forEach((result, index) => {
        console.log(`Record ${index + 1}:`);
        Object.entries(result).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
        console.log('');
      });
    }

    // Get total count and unique participants
    console.log('2. Getting counts...');
    const { count: totalCount, error: countError } = await supabase
      .from('checklist_results')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting results:', countError);
      return;
    }

    console.log(`Total checklist results: ${totalCount}`);

    // Get unique participants
    const { data: allResults, error: allError } = await supabase
      .from('checklist_results')
      .select('user_id, participant_name, participant_ic')
      .not('user_id', 'is', null);

    if (allError) {
      console.error('❌ Error getting all results:', allError);
      return;
    }

    const uniqueUserIds = [...new Set(allResults.map(r => r.user_id))];
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
    const { data: sampleUserResults, error: sampleUserError } = await supabase
      .from('checklist_results')
      .select('*')
      .eq('user_id', sampleUserId)
      .order('created_at');

    if (sampleUserError) {
      console.error('❌ Error getting sample user results:', sampleUserError);
      return;
    }

    console.log(`Sample participant (${sampleUserId}):`);
    console.log(`Total results: ${sampleUserResults.length}`);
    console.log('');

    // Group by checklist type
    const resultsByType = {};
    sampleUserResults.forEach(result => {
      const type = result.checklist_type;
      if (!resultsByType[type]) {
        resultsByType[type] = [];
      }
      resultsByType[type].push(result);
    });

    Object.entries(resultsByType).forEach(([type, results]) => {
      console.log(`${type}: ${results.length} entries`);
      results.forEach((result, index) => {
        console.log(`  ${index + 1}. ID: ${result.id}, Created: ${result.created_at}`);
        if (result.updated_at && result.updated_at !== result.created_at) {
          console.log(`      Updated: ${result.updated_at}`);
        }
      });
      console.log('');
    });

    // Check for duplicates (same user + same checklist_type)
    console.log('6. Checking for duplicate combinations...');
    const combinationCounts = {};
    allResults.forEach(result => {
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

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
checkChecklistStructure();

