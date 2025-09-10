// participantDataSummary.js
// Final summary of participant data consistency

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function participantDataSummary() {
  console.log('📊 Participant Data Consistency Summary\n');
  console.log('=' .repeat(60));
  
  try {
    // Get all data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, email')
      .order('full_name');
    
    const { data: checklistResults, error: checklistError } = await supabase
      .from('checklist_results')
      .select('id, user_id, participant_name, participant_ic');
    
    const { data: quizSessions, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('id, user_id, participant_name, participant_ic');
    
    if (profilesError || checklistError || quizError) {
      console.log('❌ Error fetching data');
      return;
    }
    
    console.log('📊 DATABASE OVERVIEW:');
    console.log('=' .repeat(60));
    console.log(`   👥 Total profiles: ${profiles.length}`);
    console.log(`   📋 Checklist results: ${checklistResults.length}`);
    console.log(`   🧪 Quiz sessions: ${quizSessions.length}`);
    
    // Check quiz sessions consistency
    const profileById = new Map();
    profiles.forEach(profile => {
      profileById.set(profile.id, profile);
    });
    
    let validQuizSessions = 0;
    let orphanedQuizSessions = 0;
    
    quizSessions.forEach(session => {
      if (profileById.has(session.user_id)) {
        validQuizSessions++;
      } else {
        orphanedQuizSessions++;
      }
    });
    
    console.log('\n📊 QUIZ SESSIONS STATUS:');
    console.log('=' .repeat(60));
    console.log(`   ✅ Valid sessions: ${validQuizSessions} (${((validQuizSessions / quizSessions.length) * 100).toFixed(1)}%)`);
    console.log(`   ❌ Orphaned sessions: ${orphanedQuizSessions} (${((orphanedQuizSessions / quizSessions.length) * 100).toFixed(1)}%)`);
    
    // Check checklist results consistency
    let validChecklistResults = 0;
    let orphanedChecklistResults = 0;
    
    checklistResults.forEach(result => {
      if (profileById.has(result.user_id)) {
        validChecklistResults++;
      } else {
        orphanedChecklistResults++;
      }
    });
    
    console.log('\n📊 CHECKLIST RESULTS STATUS:');
    console.log('=' .repeat(60));
    console.log(`   ✅ Valid results: ${validChecklistResults} (${((validChecklistResults / checklistResults.length) * 100).toFixed(1)}%)`);
    console.log(`   ❌ Orphaned results: ${orphanedChecklistResults} (${((orphanedChecklistResults / checklistResults.length) * 100).toFixed(1)}%)`);
    
    // Show remaining issues
    if (orphanedQuizSessions > 0) {
      console.log('\n❌ REMAINING ORPHANED QUIZ SESSIONS:');
      console.log('=' .repeat(60));
      
      const orphanedSessions = quizSessions.filter(session => 
        !profileById.has(session.user_id)
      );
      
      orphanedSessions.forEach((session, index) => {
        console.log(`${index + 1}. Session ${session.id}:`);
        console.log(`   Participant: ${session.participant_name} (${session.participant_ic})`);
        console.log(`   User ID: ${session.user_id}`);
      });
    }
    
    if (orphanedChecklistResults > 0) {
      console.log('\n❌ REMAINING ORPHANED CHECKLIST RESULTS:');
      console.log('=' .repeat(60));
      
      const orphanedResults = checklistResults.filter(result => 
        !profileById.has(result.user_id)
      );
      
      orphanedResults.forEach((result, index) => {
        console.log(`${index + 1}. Result ${result.id}:`);
        console.log(`   Participant: ${result.participant_name} (${result.participant_ic})`);
        console.log(`   User ID: ${result.user_id}`);
      });
    }
    
    // Overall status
    const totalRecords = quizSessions.length + checklistResults.length;
    const validRecords = validQuizSessions + validChecklistResults;
    const orphanedRecords = orphanedQuizSessions + orphanedChecklistResults;
    
    console.log('\n🎯 OVERALL STATUS:');
    console.log('=' .repeat(60));
    console.log(`   📊 Total records: ${totalRecords}`);
    console.log(`   ✅ Valid records: ${validRecords} (${((validRecords / totalRecords) * 100).toFixed(1)}%)`);
    console.log(`   ❌ Orphaned records: ${orphanedRecords} (${((orphanedRecords / totalRecords) * 100).toFixed(1)}%)`);
    
    if (orphanedRecords === 0) {
      console.log('\n🎉 PERFECT! All records are consistent!');
      console.log('   ✅ All quiz sessions reference valid profiles');
      console.log('   ✅ All checklist results reference valid profiles');
      console.log('   ✅ Data integrity achieved');
    } else {
      console.log('\n⚠️  Some records still need attention');
      console.log(`   ${orphanedRecords} records are orphaned and need to be fixed`);
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('=' .repeat(60));
    console.log('1. ✅ Participant data consistency improved significantly');
    console.log('2. 🔄 Update application code to use profiles table as source of truth');
    console.log('3. 🗑️ Consider removing duplicate participant data columns');
    console.log('4. 🔗 Use JOIN queries to get participant details from profiles table');
    console.log('5. 🧪 Test all functionality after cleanup');
    console.log('6. 📊 Add foreign key constraints to ensure data integrity');
    
    if (orphanedRecords > 0) {
      console.log('\n🔧 IMMEDIATE ACTIONS:');
      console.log('1. Fix remaining orphaned records');
      console.log('2. Delete invalid records if they cannot be matched');
      console.log('3. Ensure all new records reference valid profiles');
    }
    
  } catch (error) {
    console.error('❌ Summary failed:', error);
  }
}

// Run the summary
participantDataSummary();
