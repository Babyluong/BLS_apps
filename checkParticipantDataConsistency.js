// checkParticipantDataConsistency.js
// Check checklist_results and quiz_sessions tables for participant data consistency

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkParticipantDataConsistency() {
  console.log('🔍 Checking Participant Data Consistency\n');
  console.log('=' .repeat(60));
  
  try {
    // Check checklist_results table
    console.log('📋 Checking checklist_results table...');
    
    const { data: checklistResults, error: checklistError } = await supabase
      .from('checklist_results')
      .select('*')
      .limit(5);
    
    if (checklistError) {
      console.log(`❌ Error fetching checklist_results: ${checklistError.message}`);
    } else {
      console.log(`   📊 Found ${checklistResults.length} checklist results (showing first 5)`);
      
      if (checklistResults.length > 0) {
        console.log('\n📋 Checklist Results Structure:');
        console.log('=' .repeat(60));
        
        const sampleResult = checklistResults[0];
        const columns = Object.keys(sampleResult);
        
        columns.forEach((column, index) => {
          const value = sampleResult[column];
          const hasValue = value !== null && value !== undefined && value !== '';
          console.log(`${index + 1}. ${column}: ${typeof value} - ${hasValue ? `"${value}"` : 'NULL/EMPTY'}`);
        });
        
        console.log('\n📋 Sample Checklist Results:');
        checklistResults.forEach((result, index) => {
          console.log(`\n${index + 1}. Checklist Result ${result.id || 'N/A'}:`);
          console.log(`   Participant Name: ${result.participant_name || 'N/A'}`);
          console.log(`   Participant IC: ${result.participant_ic || 'N/A'}`);
          console.log(`   Participant Email: ${result.participant_email || 'N/A'}`);
          console.log(`   User ID: ${result.user_id || 'N/A'}`);
          console.log(`   Created: ${result.created_at || 'N/A'}`);
        });
      }
    }
    
    // Check quiz_sessions table
    console.log('\n📋 Checking quiz_sessions table...');
    
    const { data: quizSessions, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .limit(5);
    
    if (quizError) {
      console.log(`❌ Error fetching quiz_sessions: ${quizError.message}`);
    } else {
      console.log(`   📊 Found ${quizSessions.length} quiz sessions (showing first 5)`);
      
      if (quizSessions.length > 0) {
        console.log('\n📋 Quiz Sessions Structure:');
        console.log('=' .repeat(60));
        
        const sampleSession = quizSessions[0];
        const columns = Object.keys(sampleSession);
        
        columns.forEach((column, index) => {
          const value = sampleSession[column];
          const hasValue = value !== null && value !== undefined && value !== '';
          console.log(`${index + 1}. ${column}: ${typeof value} - ${hasValue ? `"${value}"` : 'NULL/EMPTY'}`);
        });
        
        console.log('\n📋 Sample Quiz Sessions:');
        quizSessions.forEach((session, index) => {
          console.log(`\n${index + 1}. Quiz Session ${session.id || 'N/A'}:`);
          console.log(`   Participant Name: ${session.participant_name || 'N/A'}`);
          console.log(`   Participant IC: ${session.participant_ic || 'N/A'}`);
          console.log(`   User ID: ${session.user_id || 'N/A'}`);
          console.log(`   Quiz Key: ${session.quiz_key || 'N/A'}`);
          console.log(`   Status: ${session.status || 'N/A'}`);
          console.log(`   Created: ${session.created_at || 'N/A'}`);
        });
      }
    }
    
    // Check for data consistency issues
    console.log('\n🔍 Checking for Data Consistency Issues...');
    console.log('=' .repeat(60));
    
    // Get all profiles for comparison
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, email')
      .order('full_name');
    
    if (profilesError) {
      console.log(`❌ Error fetching profiles: ${profilesError.message}`);
      return;
    }
    
    console.log(`   📊 Total profiles: ${allProfiles.length}`);
    
    // Create lookup maps
    const profileById = new Map();
    const profileByIC = new Map();
    const profileByEmail = new Map();
    const profileByName = new Map();
    
    allProfiles.forEach(profile => {
      profileById.set(profile.id, profile);
      if (profile.ic) profileByIC.set(profile.ic, profile);
      if (profile.email) profileByEmail.set(profile.email, profile);
      if (profile.full_name) profileByName.set(profile.full_name.toUpperCase(), profile);
    });
    
    // Check checklist_results consistency
    console.log('\n🔍 Checklist Results Consistency Check:');
    console.log('=' .repeat(60));
    
    const { data: allChecklistResults, error: allChecklistError } = await supabase
      .from('checklist_results')
      .select('id, user_id, participant_name, participant_ic, participant_email');
    
    if (!allChecklistError && allChecklistResults) {
      let consistentCount = 0;
      let inconsistentCount = 0;
      const inconsistencies = [];
      
      allChecklistResults.forEach(result => {
        const profile = profileById.get(result.user_id);
        let isConsistent = true;
        const issues = [];
        
        if (profile) {
          // Check name consistency
          if (result.participant_name && profile.full_name) {
            if (result.participant_name.toUpperCase() !== profile.full_name.toUpperCase()) {
              isConsistent = false;
              issues.push(`Name mismatch: "${result.participant_name}" vs "${profile.full_name}"`);
            }
          }
          
          // Check IC consistency
          if (result.participant_ic && profile.ic) {
            if (result.participant_ic !== profile.ic) {
              isConsistent = false;
              issues.push(`IC mismatch: "${result.participant_ic}" vs "${profile.ic}"`);
            }
          }
          
          // Check email consistency
          if (result.participant_email && profile.email) {
            if (result.participant_email !== profile.email) {
              isConsistent = false;
              issues.push(`Email mismatch: "${result.participant_email}" vs "${profile.email}"`);
            }
          }
        } else {
          isConsistent = false;
          issues.push(`Profile not found for user_id: ${result.user_id}`);
        }
        
        if (isConsistent) {
          consistentCount++;
        } else {
          inconsistentCount++;
          inconsistencies.push({
            id: result.id,
            user_id: result.user_id,
            issues: issues
          });
        }
      });
      
      console.log(`   ✅ Consistent records: ${consistentCount}`);
      console.log(`   ❌ Inconsistent records: ${inconsistentCount}`);
      
      if (inconsistencies.length > 0) {
        console.log('\n❌ Inconsistencies found:');
        inconsistencies.slice(0, 5).forEach((inc, index) => {
          console.log(`${index + 1}. Checklist Result ${inc.id}:`);
          inc.issues.forEach(issue => console.log(`   - ${issue}`));
        });
        
        if (inconsistencies.length > 5) {
          console.log(`   ... and ${inconsistencies.length - 5} more inconsistencies`);
        }
      }
    }
    
    // Check quiz_sessions consistency
    console.log('\n🔍 Quiz Sessions Consistency Check:');
    console.log('=' .repeat(60));
    
    const { data: allQuizSessions, error: allQuizError } = await supabase
      .from('quiz_sessions')
      .select('id, user_id, participant_name, participant_ic');
    
    if (!allQuizError && allQuizSessions) {
      let consistentCount = 0;
      let inconsistentCount = 0;
      const inconsistencies = [];
      
      allQuizSessions.forEach(session => {
        const profile = profileById.get(session.user_id);
        let isConsistent = true;
        const issues = [];
        
        if (profile) {
          // Check name consistency
          if (session.participant_name && profile.full_name) {
            if (session.participant_name.toUpperCase() !== profile.full_name.toUpperCase()) {
              isConsistent = false;
              issues.push(`Name mismatch: "${session.participant_name}" vs "${profile.full_name}"`);
            }
          }
          
          // Check IC consistency
          if (session.participant_ic && profile.ic) {
            if (session.participant_ic !== profile.ic) {
              isConsistent = false;
              issues.push(`IC mismatch: "${session.participant_ic}" vs "${profile.ic}"`);
            }
          }
        } else {
          isConsistent = false;
          issues.push(`Profile not found for user_id: ${session.user_id}`);
        }
        
        if (isConsistent) {
          consistentCount++;
        } else {
          inconsistentCount++;
          inconsistencies.push({
            id: session.id,
            user_id: session.user_id,
            issues: issues
          });
        }
      });
      
      console.log(`   ✅ Consistent records: ${consistentCount}`);
      console.log(`   ❌ Inconsistent records: ${inconsistentCount}`);
      
      if (inconsistencies.length > 0) {
        console.log('\n❌ Inconsistencies found:');
        inconsistencies.slice(0, 5).forEach((inc, index) => {
          console.log(`${index + 1}. Quiz Session ${inc.id}:`);
          inc.issues.forEach(issue => console.log(`   - ${issue}`));
        });
        
        if (inconsistencies.length > 5) {
          console.log(`   ... and ${inconsistencies.length - 5} more inconsistencies`);
        }
      }
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('=' .repeat(60));
    console.log('1. 🔄 Update application code to use profiles table as source of truth');
    console.log('2. 🗑️ Remove duplicate participant data from checklist_results and quiz_sessions');
    console.log('3. 🔗 Use user_id to reference profiles table instead of storing participant details');
    console.log('4. 🧪 Test all functionality after removing duplicate data');
    console.log('5. 📊 Consider adding foreign key constraints to ensure data integrity');
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Run the check
checkParticipantDataConsistency();
