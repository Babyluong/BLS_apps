// cleanupParticipantData.js
// Clean up duplicate participant data and fix inconsistencies

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanupParticipantData() {
  console.log('🧹 Cleaning Up Participant Data\n');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Get all profiles for reference
    console.log('📋 Fetching profiles for reference...');
    
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, email')
      .order('full_name');
    
    if (profilesError) {
      console.log(`❌ Error fetching profiles: ${profilesError.message}`);
      return;
    }
    
    console.log(`   📊 Found ${allProfiles.length} profiles`);
    
    // Create lookup maps
    const profileById = new Map();
    allProfiles.forEach(profile => {
      profileById.set(profile.id, profile);
    });
    
    // Step 2: Clean up checklist_results
    console.log('\n🧹 Cleaning up checklist_results...');
    
    const { data: allChecklistResults, error: checklistError } = await supabase
      .from('checklist_results')
      .select('id, user_id, participant_name, participant_ic, participant_email');
    
    if (checklistError) {
      console.log(`❌ Error fetching checklist_results: ${checklistError.message}`);
    } else {
      console.log(`   📊 Found ${allChecklistResults.length} checklist results`);
      
      let checklistUpdated = 0;
      let checklistErrors = 0;
      
      for (const result of allChecklistResults) {
        const profile = profileById.get(result.user_id);
        
        if (profile) {
          // Check if participant data matches profile data
          const nameMatches = !result.participant_name || 
                             result.participant_name.toUpperCase() === profile.full_name.toUpperCase();
          const icMatches = !result.participant_ic || result.participant_ic === profile.ic;
          const emailMatches = !result.participant_email || result.participant_email === profile.email;
          
          if (!nameMatches || !icMatches || !emailMatches) {
            console.log(`   🔄 Updating checklist result ${result.id}`);
            console.log(`      Name: ${result.participant_name} → ${profile.full_name}`);
            console.log(`      IC: ${result.participant_ic} → ${profile.ic}`);
            console.log(`      Email: ${result.participant_email} → ${profile.email}`);
            
            try {
              const { error: updateError } = await supabase
                .from('checklist_results')
                .update({
                  participant_name: profile.full_name,
                  participant_ic: profile.ic,
                  participant_email: profile.email,
                  updated_at: new Date().toISOString()
                })
                .eq('id', result.id);
              
              if (updateError) {
                console.log(`      ❌ Update failed: ${updateError.message}`);
                checklistErrors++;
              } else {
                console.log(`      ✅ Updated successfully`);
                checklistUpdated++;
              }
            } catch (error) {
              console.log(`      ❌ Unexpected error: ${error.message}`);
              checklistErrors++;
            }
          }
        } else {
          console.log(`   ⚠️  Profile not found for user_id: ${result.user_id}`);
          checklistErrors++;
        }
      }
      
      console.log(`\n📊 Checklist Results Cleanup Summary:`);
      console.log(`   ✅ Updated: ${checklistUpdated} records`);
      console.log(`   ❌ Errors: ${checklistErrors} records`);
    }
    
    // Step 3: Clean up quiz_sessions
    console.log('\n🧹 Cleaning up quiz_sessions...');
    
    const { data: allQuizSessions, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('id, user_id, participant_name, participant_ic');
    
    if (quizError) {
      console.log(`❌ Error fetching quiz_sessions: ${quizError.message}`);
    } else {
      console.log(`   📊 Found ${allQuizSessions.length} quiz sessions`);
      
      let quizUpdated = 0;
      let quizErrors = 0;
      const orphanedSessions = [];
      
      for (const session of allQuizSessions) {
        const profile = profileById.get(session.user_id);
        
        if (profile) {
          // Check if participant data matches profile data
          const nameMatches = !session.participant_name || 
                             session.participant_name.toUpperCase() === profile.full_name.toUpperCase();
          const icMatches = !session.participant_ic || session.participant_ic === profile.ic;
          
          if (!nameMatches || !icMatches) {
            console.log(`   🔄 Updating quiz session ${session.id}`);
            console.log(`      Name: ${session.participant_name} → ${profile.full_name}`);
            console.log(`      IC: ${session.participant_ic} → ${profile.ic}`);
            
            try {
              const { error: updateError } = await supabase
                .from('quiz_sessions')
                .update({
                  participant_name: profile.full_name,
                  participant_ic: profile.ic,
                  updated_at: new Date().toISOString()
                })
                .eq('id', session.id);
              
              if (updateError) {
                console.log(`      ❌ Update failed: ${updateError.message}`);
                quizErrors++;
              } else {
                console.log(`      ✅ Updated successfully`);
                quizUpdated++;
              }
            } catch (error) {
              console.log(`      ❌ Unexpected error: ${error.message}`);
              quizErrors++;
            }
          }
        } else {
          console.log(`   ⚠️  Profile not found for user_id: ${session.user_id}`);
          orphanedSessions.push(session);
          quizErrors++;
        }
      }
      
      console.log(`\n📊 Quiz Sessions Cleanup Summary:`);
      console.log(`   ✅ Updated: ${quizUpdated} records`);
      console.log(`   ❌ Errors: ${quizErrors} records`);
      console.log(`   🚫 Orphaned sessions: ${orphanedSessions.length} records`);
      
      if (orphanedSessions.length > 0) {
        console.log('\n🚫 Orphaned Quiz Sessions (no matching profile):');
        orphanedSessions.slice(0, 5).forEach((session, index) => {
          console.log(`${index + 1}. Session ${session.id}:`);
          console.log(`   User ID: ${session.user_id}`);
          console.log(`   Participant: ${session.participant_name} (${session.participant_ic})`);
        });
        
        if (orphanedSessions.length > 5) {
          console.log(`   ... and ${orphanedSessions.length - 5} more orphaned sessions`);
        }
      }
    }
    
    // Step 4: Final verification
    console.log('\n🔍 Final Verification...');
    console.log('=' .repeat(60));
    
    // Check checklist_results consistency
    const { data: finalChecklistResults, error: finalChecklistError } = await supabase
      .from('checklist_results')
      .select('id, user_id, participant_name, participant_ic, participant_email');
    
    if (!finalChecklistError && finalChecklistResults) {
      let consistentCount = 0;
      let inconsistentCount = 0;
      
      finalChecklistResults.forEach(result => {
        const profile = profileById.get(result.user_id);
        let isConsistent = true;
        
        if (profile) {
          if (result.participant_name && profile.full_name) {
            if (result.participant_name.toUpperCase() !== profile.full_name.toUpperCase()) {
              isConsistent = false;
            }
          }
          if (result.participant_ic && profile.ic) {
            if (result.participant_ic !== profile.ic) {
              isConsistent = false;
            }
          }
          if (result.participant_email && profile.email) {
            if (result.participant_email !== profile.email) {
              isConsistent = false;
            }
          }
        } else {
          isConsistent = false;
        }
        
        if (isConsistent) {
          consistentCount++;
        } else {
          inconsistentCount++;
        }
      });
      
      console.log(`📊 Checklist Results Consistency:`);
      console.log(`   ✅ Consistent: ${consistentCount} records`);
      console.log(`   ❌ Inconsistent: ${inconsistentCount} records`);
    }
    
    // Check quiz_sessions consistency
    const { data: finalQuizSessions, error: finalQuizError } = await supabase
      .from('quiz_sessions')
      .select('id, user_id, participant_name, participant_ic');
    
    if (!finalQuizError && finalQuizSessions) {
      let consistentCount = 0;
      let inconsistentCount = 0;
      
      finalQuizSessions.forEach(session => {
        const profile = profileById.get(session.user_id);
        let isConsistent = true;
        
        if (profile) {
          if (session.participant_name && profile.full_name) {
            if (session.participant_name.toUpperCase() !== profile.full_name.toUpperCase()) {
              isConsistent = false;
            }
          }
          if (session.participant_ic && profile.ic) {
            if (session.participant_ic !== profile.ic) {
              isConsistent = false;
            }
          }
        } else {
          isConsistent = false;
        }
        
        if (isConsistent) {
          consistentCount++;
        } else {
          inconsistentCount++;
        }
      });
      
      console.log(`📊 Quiz Sessions Consistency:`);
      console.log(`   ✅ Consistent: ${consistentCount} records`);
      console.log(`   ❌ Inconsistent: ${inconsistentCount} records`);
    }
    
    // Recommendations
    console.log('\n💡 NEXT STEPS:');
    console.log('=' .repeat(60));
    console.log('1. ✅ Participant data cleaned up');
    console.log('2. 🔄 Update application code to use profiles table as source of truth');
    console.log('3. 🗑️ Consider removing participant_name, participant_ic, participant_email columns');
    console.log('4. 🔗 Use JOIN queries to get participant details from profiles table');
    console.log('5. 🧪 Test all functionality after cleanup');
    console.log('6. 📊 Add foreign key constraints to ensure data integrity');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Run the cleanup
cleanupParticipantData();
