// checkForDuplicates.js - Check for duplicate records in bls_results
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkForDuplicates() {
  console.log('🔍 Checking for duplicate records in bls_results...\n');

  try {
    // Get all bls_results
    const { data: allResults, error: allError } = await supabase
      .from('bls_results')
      .select('id, user_id, participant_name, participant_ic, created_at')
      .order('user_id, created_at');

    if (allError) {
      console.error('❌ Error getting all results:', allError);
      return;
    }

    console.log(`Total bls_results: ${allResults.length}`);
    console.log('');

    // Check for duplicates by user_id
    const userCounts = {};
    allResults.forEach(result => {
      const userId = result.user_id;
      userCounts[userId] = (userCounts[userId] || 0) + 1;
    });

    const duplicates = Object.entries(userCounts).filter(([userId, count]) => count > 1);
    
    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} participants with duplicate records:`);
      duplicates.forEach(([userId, count]) => {
        console.log(`  User ${userId}: ${count} records`);
        
        // Show the duplicate records
        const userRecords = allResults.filter(r => r.user_id === userId);
        userRecords.forEach((record, index) => {
          console.log(`    ${index + 1}. ID: ${record.id}, Created: ${record.created_at}, Name: ${record.participant_name}`);
        });
        console.log('');
      });
    } else {
      console.log('✅ No duplicate user_ids found');
    }

    // Check for duplicates by participant_ic
    console.log('\nChecking for duplicates by participant_ic...');
    const icCounts = {};
    allResults.forEach(result => {
      const ic = result.participant_ic;
      icCounts[ic] = (icCounts[ic] || 0) + 1;
    });

    const icDuplicates = Object.entries(icCounts).filter(([ic, count]) => count > 1);
    
    if (icDuplicates.length > 0) {
      console.log(`Found ${icDuplicates.length} ICs with duplicate records:`);
      icDuplicates.forEach(([ic, count]) => {
        console.log(`  IC ${ic}: ${count} records`);
        
        // Show the duplicate records
        const icRecords = allResults.filter(r => r.participant_ic === ic);
        icRecords.forEach((record, index) => {
          console.log(`    ${index + 1}. ID: ${record.id}, User: ${record.user_id}, Name: ${record.participant_name}`);
        });
        console.log('');
      });
    } else {
      console.log('✅ No duplicate participant_ic found');
    }

    // Check for duplicates by participant_name
    console.log('\nChecking for duplicates by participant_name...');
    const nameCounts = {};
    allResults.forEach(result => {
      const name = result.participant_name;
      nameCounts[name] = (nameCounts[name] || 0) + 1;
    });

    const nameDuplicates = Object.entries(nameCounts).filter(([name, count]) => count > 1);
    
    if (nameDuplicates.length > 0) {
      console.log(`Found ${nameDuplicates.length} names with duplicate records:`);
      nameDuplicates.forEach(([name, count]) => {
        console.log(`  Name ${name}: ${count} records`);
        
        // Show the duplicate records
        const nameRecords = allResults.filter(r => r.participant_name === name);
        nameRecords.forEach((record, index) => {
          console.log(`    ${index + 1}. ID: ${record.id}, User: ${record.user_id}, IC: ${record.participant_ic}`);
        });
        console.log('');
      });
    } else {
      console.log('✅ No duplicate participant_name found');
    }

    // Summary
    console.log('\nSUMMARY:');
    console.log(`Total records: ${allResults.length}`);
    console.log(`Unique user_ids: ${Object.keys(userCounts).length}`);
    console.log(`Unique participant_ic: ${Object.keys(icCounts).length}`);
    console.log(`Unique participant_name: ${Object.keys(nameCounts).length}`);
    console.log(`User_id duplicates: ${duplicates.length}`);
    console.log(`IC duplicates: ${icDuplicates.length}`);
    console.log(`Name duplicates: ${nameDuplicates.length}`);

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
checkForDuplicates();

