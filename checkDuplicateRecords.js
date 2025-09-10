// checkDuplicateRecords.js
// Check for duplicate records in bls_results table

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDuplicateRecords() {
  try {
    console.log('🔍 Checking for duplicate records in bls_results...\n');

    // Get all records from bls_results
    const { data: allRecords, error } = await supabase
      .from('bls_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('❌ Error fetching records:', error.message);
      return;
    }

    console.log(`Total records in bls_results: ${allRecords.length}`);

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
    
    console.log(`\nUnique users: ${Object.keys(userGroups).length}`);
    console.log(`Users with duplicates: ${duplicateUsers.length}`);

    if (duplicateUsers.length > 0) {
      console.log('\n🔍 Duplicate records found:');
      duplicateUsers.forEach(([userId, records]) => {
        console.log(`\nUser ID: ${userId}`);
        console.log(`Number of records: ${records.length}`);
        records.forEach((record, index) => {
          console.log(`  Record ${index + 1}:`);
          console.log(`    ID: ${record.id}`);
          console.log(`    Created: ${record.created_at}`);
          console.log(`    Updated: ${record.updated_at}`);
          console.log(`    Pre-test: ${record.pre_test_score || 'N/A'}`);
          console.log(`    Post-test: ${record.post_test_score || 'N/A'}`);
          console.log(`    One-man CPR: ${record.one_man_cpr_pass || 'N/A'}`);
          console.log(`    Two-man CPR: ${record.two_man_cpr_pass || 'N/A'}`);
          console.log(`    Adult Choking: ${record.adult_choking_pass || 'N/A'}`);
          console.log(`    Infant Choking: ${record.infant_choking_pass || 'N/A'}`);
          console.log(`    Infant CPR: ${record.infant_cpr_pass || 'N/A'}`);
        });
      });
    }

    // Check for records with same user_id and similar data
    console.log('\n🔍 Checking for similar records...');
    const similarRecords = [];
    
    Object.entries(userGroups).forEach(([userId, records]) => {
      if (records.length > 1) {
        // Check if records have similar data
        for (let i = 0; i < records.length; i++) {
          for (let j = i + 1; j < records.length; j++) {
            const record1 = records[i];
            const record2 = records[j];
            
            const isSimilar = 
              record1.pre_test_score === record2.pre_test_score &&
              record1.post_test_score === record2.post_test_score &&
              record1.one_man_cpr_pass === record2.one_man_cpr_pass &&
              record1.two_man_cpr_pass === record2.two_man_cpr_pass &&
              record1.adult_choking_pass === record2.adult_choking_pass &&
              record1.infant_choking_pass === record2.infant_choking_pass &&
              record1.infant_cpr_pass === record2.infant_cpr_pass;
            
            if (isSimilar) {
              similarRecords.push({
                userId,
                record1: record1.id,
                record2: record2.id,
                created1: record1.created_at,
                created2: record2.created_at
              });
            }
          }
        }
      }
    });

    if (similarRecords.length > 0) {
      console.log(`\nFound ${similarRecords.length} pairs of similar records:`);
      similarRecords.forEach((similar, index) => {
        console.log(`\nSimilar pair ${index + 1}:`);
        console.log(`  User ID: ${similar.userId}`);
        console.log(`  Record 1: ${similar.record1} (${similar.created1})`);
        console.log(`  Record 2: ${similar.record2} (${similar.created2})`);
      });
    }

    // Get unique user count from original tables
    console.log('\n🔍 Checking original tables for unique participants...');
    
    // Get unique participants from quiz_sessions
    const { data: quizSessions } = await supabase
      .from('quiz_sessions')
      .select('user_id, participant_ic')
      .eq('status', 'submitted');
    
    const uniqueQuizUsers = new Set(quizSessions?.map(s => s.user_id) || []);
    console.log(`Unique users in quiz_sessions: ${uniqueQuizUsers.size}`);

    // Get unique participants from checklist_results
    const { data: checklistResults } = await supabase
      .from('checklist_results')
      .select('user_id, participant_ic');
    
    const uniqueChecklistUsers = new Set(checklistResults?.map(r => r.user_id) || []);
    console.log(`Unique users in checklist_results: ${uniqueChecklistUsers.size}`);

    // Get combined unique users
    const allUniqueUsers = new Set([...uniqueQuizUsers, ...uniqueChecklistUsers]);
    console.log(`Combined unique users: ${allUniqueUsers.size}`);

    console.log('\n📊 Summary:');
    console.log(`- Records in bls_results: ${allRecords.length}`);
    console.log(`- Unique users in bls_results: ${Object.keys(userGroups).length}`);
    console.log(`- Expected unique users: ${allUniqueUsers.size}`);
    console.log(`- Extra records: ${allRecords.length - allUniqueUsers.size}`);

  } catch (error) {
    console.error('❌ Error checking duplicates:', error);
  }
}

checkDuplicateRecords();

