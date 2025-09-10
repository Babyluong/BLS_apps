// checkMissingParticipants.js
// Check for missing participants and identify the issue

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMissingParticipants() {
  try {
    console.log('🔍 Checking for missing participants...\n');

    // Get current bls_results
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('user_id, participant_name, participant_ic')
      .order('created_at', { ascending: false });

    if (blsError) {
      console.log('❌ Error fetching bls_results:', blsError.message);
      return;
    }

    console.log(`📊 Current bls_results: ${blsResults.length} records`);

    // Get all quiz sessions
    const { data: quizSessions, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('user_id, participant_name, participant_ic')
      .eq('status', 'submitted');

    if (quizError) {
      console.log('❌ Error fetching quiz_sessions:', quizError.message);
      return;
    }

    // Get all checklist results
    const { data: checklistResults, error: checklistError } = await supabase
      .from('checklist_results')
      .select('user_id, participant_name, participant_ic');

    if (checklistError) {
      console.log('❌ Error fetching checklist_results:', checklistError.message);
      return;
    }

    console.log(`📊 Quiz sessions: ${quizSessions.length} records`);
    console.log(`📊 Checklist results: ${checklistResults.length} records`);

    // Find unique participants from original tables
    const uniqueQuizUsers = new Set(quizSessions.map(s => s.user_id));
    const uniqueChecklistUsers = new Set(checklistResults.map(s => s.user_id));
    const allOriginalUsers = new Set([...uniqueQuizUsers, ...uniqueChecklistUsers]);

    console.log(`\n👥 Original data analysis:`);
    console.log(`- Unique users in quiz_sessions: ${uniqueQuizUsers.size}`);
    console.log(`- Unique users in checklist_results: ${uniqueChecklistUsers.size}`);
    console.log(`- Combined unique users: ${allOriginalUsers.size}`);

    // Find users in original data but not in bls_results
    const blsUserIds = new Set(blsResults.map(r => r.user_id));
    const missingUsers = [...allOriginalUsers].filter(userId => !blsUserIds.has(userId));

    console.log(`\n⚠️ Missing users (${missingUsers.length}):`);
    if (missingUsers.length > 0) {
      missingUsers.forEach((userId, index) => {
        console.log(`\n${index + 1}. User ID: ${userId}`);
        
        // Find participant info from quiz sessions
        const quizSessionsForUser = quizSessions.filter(s => s.user_id === userId);
        if (quizSessionsForUser.length > 0) {
          console.log(`   Quiz sessions: ${quizSessionsForUser.length}`);
          console.log(`   Name: ${quizSessionsForUser[0].participant_name || 'N/A'}`);
          console.log(`   IC: ${quizSessionsForUser[0].participant_ic || 'N/A'}`);
        }

        // Find participant info from checklist results
        const checklistResultsForUser = checklistResults.filter(r => r.user_id === userId);
        if (checklistResultsForUser.length > 0) {
          console.log(`   Checklist results: ${checklistResultsForUser.length}`);
          console.log(`   Name: ${checklistResultsForUser[0].participant_name || 'N/A'}`);
          console.log(`   IC: ${checklistResultsForUser[0].participant_ic || 'N/A'}`);
        }
      });
    }

    // Check for specific names mentioned by user
    const targetNames = ['amri', 'amit', 'jusnie'];
    console.log(`\n🔍 Checking for specific names: ${targetNames.join(', ')}`);
    
    const foundNames = [];
    const allRecords = [...quizSessions, ...checklistResults];
    
    allRecords.forEach(record => {
      if (record.participant_name) {
        const name = record.participant_name.toLowerCase();
        targetNames.forEach(targetName => {
          if (name.includes(targetName.toLowerCase())) {
            foundNames.push({
              name: record.participant_name,
              ic: record.participant_ic,
              user_id: record.user_id,
              source: 'quiz' in record ? 'quiz_sessions' : 'checklist_results'
            });
          }
        });
      }
    });

    if (foundNames.length > 0) {
      console.log(`\n✅ Found records with similar names:`);
      foundNames.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.name} (${record.ic})`);
        console.log(`     User ID: ${record.user_id}`);
        console.log(`     Source: ${record.source}`);
        console.log(`     In bls_results: ${blsUserIds.has(record.user_id) ? 'YES' : 'NO'}`);
      });
    } else {
      console.log(`\n❌ No records found with names containing: ${targetNames.join(', ')}`);
    }

    // Show all participant names for reference
    console.log(`\n📋 All participant names in bls_results:`);
    blsResults.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.participant_name || 'N/A'} (${record.participant_ic || 'N/A'})`);
    });

    // Summary
    console.log(`\n📊 SUMMARY:`);
    console.log(`===========`);
    console.log(`Expected participants: 56`);
    console.log(`Current bls_results: ${blsResults.length}`);
    console.log(`Missing participants: ${56 - blsResults.length}`);
    console.log(`Missing users from original data: ${missingUsers.length}`);

  } catch (error) {
    console.error('❌ Error checking missing participants:', error);
  }
}

checkMissingParticipants();

