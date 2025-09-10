// investigateProblemUser.js
// Investigate the user with multiple names and ICs

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigateProblemUser() {
  try {
    const problemUserId = '1543357e-7c30-4f74-9b0f-333843e42a15';
    
    console.log(`🔍 Investigating problem user: ${problemUserId}\n`);

    // Get all quiz sessions for this user
    const { data: quizSessions, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('user_id', problemUserId)
      .order('updated_at', { ascending: true });

    if (quizError) {
      console.log('❌ Error fetching quiz sessions:', quizError.message);
      return;
    }

    // Get all checklist results for this user
    const { data: checklistResults, error: checklistError } = await supabase
      .from('checklist_results')
      .select('*')
      .eq('user_id', problemUserId)
      .order('updated_at', { ascending: true });

    if (checklistError) {
      console.log('❌ Error fetching checklist results:', checklistError.message);
      return;
    }

    // Get bls_results for this user
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('*')
      .eq('user_id', problemUserId);

    if (blsError) {
      console.log('❌ Error fetching bls results:', blsError.message);
      return;
    }

    console.log(`📊 Data for user ${problemUserId}:`);
    console.log(`- Quiz sessions: ${quizSessions.length}`);
    console.log(`- Checklist results: ${checklistResults.length}`);
    console.log(`- BLS results: ${blsResults.length}`);

    // Analyze quiz sessions
    console.log(`\n📝 Quiz Sessions Analysis:`);
    console.log(`========================`);
    
    const quizByParticipant = {};
    quizSessions.forEach(session => {
      const key = `${session.participant_name}_${session.participant_ic}`;
      if (!quizByParticipant[key]) {
        quizByParticipant[key] = [];
      }
      quizByParticipant[key].push(session);
    });

    Object.entries(quizByParticipant).forEach(([participant, sessions]) => {
      console.log(`\nParticipant: ${participant}`);
      console.log(`Sessions: ${sessions.length}`);
      sessions.forEach((session, index) => {
        console.log(`  ${index + 1}. ${session.quiz_key} - Score: ${session.score}/${session.total_questions} - ${session.created_at}`);
      });
    });

    // Analyze checklist results
    console.log(`\n📋 Checklist Results Analysis:`);
    console.log(`=============================`);
    
    const checklistByParticipant = {};
    checklistResults.forEach(result => {
      const key = `${result.participant_name}_${result.participant_ic}`;
      if (!checklistByParticipant[key]) {
        checklistByParticipant[key] = [];
      }
      checklistByParticipant[key].push(result);
    });

    Object.entries(checklistByParticipant).forEach(([participant, results]) => {
      console.log(`\nParticipant: ${participant}`);
      console.log(`Results: ${results.length}`);
      results.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.checklist_type} - ${result.status} (${result.score}/${result.total_items}) - ${result.created_at}`);
      });
    });

    // Check for unique participants
    const uniqueQuizParticipants = new Set(quizSessions.map(s => `${s.participant_name}_${s.participant_ic}`));
    const uniqueChecklistParticipants = new Set(checklistResults.map(r => `${r.participant_name}_${r.participant_ic}`));
    const allUniqueParticipants = new Set([...uniqueQuizParticipants, ...uniqueChecklistParticipants]);

    console.log(`\n👥 Unique Participants:`);
    console.log(`=====================`);
    console.log(`Quiz participants: ${uniqueQuizParticipants.size}`);
    console.log(`Checklist participants: ${uniqueChecklistParticipants.size}`);
    console.log(`Combined unique participants: ${allUniqueParticipants.size}`);

    console.log(`\n📋 All unique participants:`);
    Array.from(allUniqueParticipants).sort().forEach((participant, index) => {
      console.log(`  ${index + 1}. ${participant}`);
    });

    // Check if this user should be split into multiple users
    console.log(`\n🔧 Recommendation:`);
    console.log(`================`);
    if (allUniqueParticipants.size > 1) {
      console.log(`⚠️ This user_id represents ${allUniqueParticipants.size} different people!`);
      console.log(`This explains why we have 57 records instead of 56.`);
      console.log(`\nSuggested action:`);
      console.log(`1. Create separate user_ids for each unique participant`);
      console.log(`2. Update the records to use the correct user_ids`);
      console.log(`3. This will reduce the count from 57 to 56 + ${allUniqueParticipants.size - 1} = ${56 + allUniqueParticipants.size - 1} total records`);
    } else {
      console.log(`✅ This user represents only one person.`);
    }

  } catch (error) {
    console.error('❌ Error investigating problem user:', error);
  }
}

investigateProblemUser();
