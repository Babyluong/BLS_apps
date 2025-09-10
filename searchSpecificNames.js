// searchSpecificNames.js
// Search for specific names mentioned by user

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function searchSpecificNames() {
  try {
    console.log('🔍 Searching for specific names: amri, amit, jusnie\n');

    // Search in quiz_sessions
    const { data: quizSessions, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('user_id, participant_name, participant_ic, quiz_key, score')
      .eq('status', 'submitted');

    if (quizError) {
      console.log('❌ Error fetching quiz_sessions:', quizError.message);
      return;
    }

    // Search in checklist_results
    const { data: checklistResults, error: checklistError } = await supabase
      .from('checklist_results')
      .select('user_id, participant_name, participant_ic, checklist_type, status');

    if (checklistError) {
      console.log('❌ Error fetching checklist_results:', checklistError.message);
      return;
    }

    // Search in bls_results
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('user_id, participant_name, participant_ic');

    if (blsError) {
      console.log('❌ Error fetching bls_results:', blsError.message);
      return;
    }

    console.log(`📊 Current counts:`);
    console.log(`- Quiz sessions: ${quizSessions.length}`);
    console.log(`- Checklist results: ${checklistResults.length}`);
    console.log(`- BLS results: ${blsResults.length}`);

    // Search for names containing the target words
    const targetWords = ['amri', 'amit', 'jusnie'];
    const allRecords = [
      ...quizSessions.map(r => ({ ...r, source: 'quiz_sessions' })),
      ...checklistResults.map(r => ({ ...r, source: 'checklist_results' })),
      ...blsResults.map(r => ({ ...r, source: 'bls_results' }))
    ];

    console.log(`\n🔍 Searching for names containing: ${targetWords.join(', ')}`);
    
    const foundRecords = [];
    allRecords.forEach(record => {
      if (record.participant_name) {
        const name = record.participant_name.toLowerCase();
        targetWords.forEach(targetWord => {
          if (name.includes(targetWord.toLowerCase())) {
            foundRecords.push({
              ...record,
              matchedWord: targetWord
            });
          }
        });
      }
    });

    if (foundRecords.length > 0) {
      console.log(`\n✅ Found ${foundRecords.length} records with matching names:`);
      
      // Group by user_id
      const groupedByUser = {};
      foundRecords.forEach(record => {
        if (!groupedByUser[record.user_id]) {
          groupedByUser[record.user_id] = {
            user_id: record.user_id,
            participant_name: record.participant_name,
            participant_ic: record.participant_ic,
            sources: new Set(),
            matchedWords: new Set()
          };
        }
        groupedByUser[record.user_id].sources.add(record.source);
        groupedByUser[record.user_id].matchedWords.add(record.matchedWord);
      });

      Object.values(groupedByUser).forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.participant_name} (${user.participant_ic})`);
        console.log(`   User ID: ${user.user_id}`);
        console.log(`   Found in: ${Array.from(user.sources).join(', ')}`);
        console.log(`   Matched words: ${Array.from(user.matchedWords).join(', ')}`);
        console.log(`   In bls_results: ${user.sources.has('bls_results') ? 'YES' : 'NO'}`);
      });
    } else {
      console.log(`\n❌ No records found with names containing: ${targetWords.join(', ')}`);
    }

    // Show all unique participant names for reference
    console.log(`\n📋 All unique participant names in the system:`);
    const allNames = new Set();
    allRecords.forEach(record => {
      if (record.participant_name) {
        allNames.add(record.participant_name);
      }
    });

    Array.from(allNames).sort().forEach((name, index) => {
      console.log(`  ${index + 1}. ${name}`);
    });

  } catch (error) {
    console.error('❌ Error searching for specific names:', error);
  }
}

searchSpecificNames();

