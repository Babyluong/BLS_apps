// investigateParticipantCount.js
// Investigate why we have 57 records instead of 56 participants

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigateParticipantCount() {
  try {
    console.log('🔍 Investigating participant count discrepancy...\n');

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

    // Analyze unique users in each table
    const uniqueQuizUsers = new Set(quizSessions.map(s => s.user_id));
    const uniqueChecklistUsers = new Set(checklistResults.map(s => s.user_id));
    const uniqueBlsUsers = new Set(blsResults.map(r => r.user_id));

    console.log(`\n👥 Unique users analysis:`);
    console.log(`- Quiz sessions: ${uniqueQuizUsers.size} unique users`);
    console.log(`- Checklist results: ${uniqueChecklistUsers.size} unique users`);
    console.log(`- BLS results: ${uniqueBlsUsers.size} unique users`);

    // Find users that are in bls_results but not in original tables
    const usersOnlyInBls = [...uniqueBlsUsers].filter(userId => 
      !uniqueQuizUsers.has(userId) && !uniqueChecklistUsers.has(userId)
    );

    if (usersOnlyInBls.length > 0) {
      console.log(`\n⚠️ Users only in bls_results (${usersOnlyInBls.length}):`);
      usersOnlyInBls.forEach(userId => {
        const blsRecord = blsResults.find(r => r.user_id === userId);
        console.log(`  - User ID: ${userId}`);
        console.log(`    Pre-test: ${blsRecord.pre_test_score || 'N/A'}`);
        console.log(`    Post-test: ${blsRecord.post_test_score || 'N/A'}`);
        console.log(`    One-man CPR: ${blsRecord.one_man_cpr_pass || 'N/A'}`);
        console.log(`    Two-man CPR: ${blsRecord.two_man_cpr_pass || 'N/A'}`);
        console.log(`    Adult Choking: ${blsRecord.adult_choking_pass || 'N/A'}`);
        console.log(`    Infant Choking: ${blsRecord.infant_choking_pass || 'N/A'}`);
        console.log(`    Infant CPR: ${blsRecord.infant_cpr_pass || 'N/A'}`);
      });
    }

    // Find users that are in original tables but not in bls_results
    const allOriginalUsers = new Set([...uniqueQuizUsers, ...uniqueChecklistUsers]);
    const usersMissingFromBls = [...allOriginalUsers].filter(userId => !uniqueBlsUsers.has(userId));

    if (usersMissingFromBls.length > 0) {
      console.log(`\n⚠️ Users missing from bls_results (${usersMissingFromBls.length}):`);
      usersMissingFromBls.forEach(userId => {
        const quizSessionsForUser = quizSessions.filter(s => s.user_id === userId);
        const checklistResultsForUser = checklistResults.filter(r => r.user_id === userId);
        
        console.log(`  - User ID: ${userId}`);
        console.log(`    Quiz sessions: ${quizSessionsForUser.length}`);
        console.log(`    Checklist results: ${checklistResultsForUser.length}`);
        
        if (quizSessionsForUser.length > 0) {
          console.log(`    Quiz participant name: ${quizSessionsForUser[0].participant_name || 'N/A'}`);
          console.log(`    Quiz participant IC: ${quizSessionsForUser[0].participant_ic || 'N/A'}`);
        }
        if (checklistResultsForUser.length > 0) {
          console.log(`    Checklist participant name: ${checklistResultsForUser[0].participant_name || 'N/A'}`);
          console.log(`    Checklist participant IC: ${checklistResultsForUser[0].participant_ic || 'N/A'}`);
        }
      });
    }

    // Check for duplicate user_ids in bls_results
    const userCounts = {};
    blsResults.forEach(record => {
      userCounts[record.user_id] = (userCounts[record.user_id] || 0) + 1;
    });

    const duplicateUsers = Object.entries(userCounts).filter(([userId, count]) => count > 1);
    
    if (duplicateUsers.length > 0) {
      console.log(`\n⚠️ Duplicate users in bls_results (${duplicateUsers.length}):`);
      duplicateUsers.forEach(([userId, count]) => {
        console.log(`  - User ID: ${userId} (${count} records)`);
        const userRecords = blsResults.filter(r => r.user_id === userId);
        userRecords.forEach((record, index) => {
          console.log(`    Record ${index + 1}: ID ${record.id}, Created: ${record.created_at}`);
        });
      });
    }

    // Check for users with multiple ICs or names
    console.log(`\n🔍 Checking for users with multiple ICs or names...`);
    
    const userInfo = {};
    quizSessions.forEach(session => {
      if (!userInfo[session.user_id]) {
        userInfo[session.user_id] = { names: new Set(), ics: new Set() };
      }
      if (session.participant_name) userInfo[session.user_id].names.add(session.participant_name);
      if (session.participant_ic) userInfo[session.user_id].ics.add(session.participant_ic);
    });

    checklistResults.forEach(result => {
      if (!userInfo[result.user_id]) {
        userInfo[result.user_id] = { names: new Set(), ics: new Set() };
      }
      if (result.participant_name) userInfo[result.user_id].names.add(result.participant_name);
      if (result.participant_ic) userInfo[result.user_id].ics.add(result.participant_ic);
    });

    const usersWithMultipleInfo = Object.entries(userInfo).filter(([userId, info]) => 
      info.names.size > 1 || info.ics.size > 1
    );

    if (usersWithMultipleInfo.length > 0) {
      console.log(`\n⚠️ Users with multiple names or ICs (${usersWithMultipleInfo.length}):`);
      usersWithMultipleInfo.forEach(([userId, info]) => {
        console.log(`  - User ID: ${userId}`);
        if (info.names.size > 1) {
          console.log(`    Names: ${Array.from(info.names).join(', ')}`);
        }
        if (info.ics.size > 1) {
          console.log(`    ICs: ${Array.from(info.ics).join(', ')}`);
        }
      });
    }

    // Summary
    console.log(`\n📊 SUMMARY:`);
    console.log(`============`);
    console.log(`Expected participants: 56`);
    console.log(`BLS results records: ${blsResults.length}`);
    console.log(`Extra records: ${blsResults.length - 56}`);
    console.log(`Users only in bls_results: ${usersOnlyInBls.length}`);
    console.log(`Users missing from bls_results: ${usersMissingFromBls.length}`);
    console.log(`Duplicate users in bls_results: ${duplicateUsers.length}`);
    console.log(`Users with multiple names/ICs: ${usersWithMultipleInfo.length}`);

  } catch (error) {
    console.error('❌ Error investigating participant count:', error);
  }
}

investigateParticipantCount();

