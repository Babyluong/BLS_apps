// fixAllOrphanedRecords.js
// Fix all remaining orphaned quiz sessions and checklist results

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixAllOrphanedRecords() {
  console.log('🔧 Fixing All Orphaned Records\n');
  console.log('=' .repeat(60));
  
  try {
    // Get all profiles
    console.log('📋 Fetching all profiles...');
    
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
    const profileByIC = new Map();
    const profileByName = new Map();
    
    allProfiles.forEach(profile => {
      profileById.set(profile.id, profile);
      if (profile.ic) profileByIC.set(profile.ic, profile);
      if (profile.full_name) profileByName.set(profile.full_name.toUpperCase(), profile);
    });
    
    // Fix orphaned quiz sessions
    console.log('\n🧪 Fixing orphaned quiz sessions...');
    
    const { data: allQuizSessions, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('id, user_id, participant_name, participant_ic');
    
    if (quizError) {
      console.log(`❌ Error fetching quiz sessions: ${quizError.message}`);
    } else {
      const orphanedQuizSessions = allQuizSessions.filter(session => 
        !profileById.has(session.user_id)
      );
      
      console.log(`   🚫 Found ${orphanedQuizSessions.length} orphaned quiz sessions`);
      
      let quizFixed = 0;
      let quizErrors = 0;
      
      for (const session of orphanedQuizSessions) {
        console.log(`\n👤 Processing quiz session: ${session.id}`);
        console.log(`   Participant: ${session.participant_name} (${session.participant_ic})`);
        console.log(`   Current user_id: ${session.user_id}`);
        
        let matchedProfile = null;
        let matchMethod = '';
        
        // Try to match by IC first
        if (session.participant_ic) {
          matchedProfile = profileByIC.get(session.participant_ic);
          if (matchedProfile) {
            matchMethod = 'IC';
          }
        }
        
        // Try to match by name if IC didn't work
        if (!matchedProfile && session.participant_name) {
          matchedProfile = profileByName.get(session.participant_name.toUpperCase());
          if (matchedProfile) {
            matchMethod = 'Name';
          }
        }
        
        if (matchedProfile) {
          console.log(`   ✅ Found match by ${matchMethod}: ${matchedProfile.full_name}`);
          console.log(`   📧 Email: ${matchedProfile.email}`);
          console.log(`   🆔 Correct user_id: ${matchedProfile.id}`);
          
          try {
            const { error: updateError } = await supabase
              .from('quiz_sessions')
              .update({
                user_id: matchedProfile.id,
                participant_name: matchedProfile.full_name,
                participant_ic: matchedProfile.ic,
                updated_at: new Date().toISOString()
              })
              .eq('id', session.id);
            
            if (updateError) {
              console.log(`   ❌ Update failed: ${updateError.message}`);
              quizErrors++;
            } else {
              console.log(`   ✅ Updated successfully`);
              quizFixed++;
            }
          } catch (error) {
            console.log(`   ❌ Unexpected error: ${error.message}`);
            quizErrors++;
          }
        } else {
          console.log(`   ❌ No matching profile found`);
          quizErrors++;
        }
      }
      
      console.log(`\n📊 Quiz Sessions Fix Summary:`);
      console.log(`   ✅ Fixed: ${quizFixed} sessions`);
      console.log(`   ❌ Errors: ${quizErrors} sessions`);
    }
    
    // Fix orphaned checklist results
    console.log('\n📋 Fixing orphaned checklist results...');
    
    const { data: allChecklistResults, error: checklistError } = await supabase
      .from('checklist_results')
      .select('id, user_id, participant_name, participant_ic');
    
    if (checklistError) {
      console.log(`❌ Error fetching checklist results: ${checklistError.message}`);
    } else {
      const orphanedChecklistResults = allChecklistResults.filter(result => 
        !profileById.has(result.user_id)
      );
      
      console.log(`   🚫 Found ${orphanedChecklistResults.length} orphaned checklist results`);
      
      let checklistFixed = 0;
      let checklistErrors = 0;
      
      for (const result of orphanedChecklistResults) {
        console.log(`\n👤 Processing checklist result: ${result.id}`);
        console.log(`   Participant: ${result.participant_name} (${result.participant_ic})`);
        console.log(`   Current user_id: ${result.user_id}`);
        
        let matchedProfile = null;
        let matchMethod = '';
        
        // Try to match by IC first
        if (result.participant_ic) {
          matchedProfile = profileByIC.get(result.participant_ic);
          if (matchedProfile) {
            matchMethod = 'IC';
          }
        }
        
        // Try to match by name if IC didn't work
        if (!matchedProfile && result.participant_name) {
          matchedProfile = profileByName.get(result.participant_name.toUpperCase());
          if (matchedProfile) {
            matchMethod = 'Name';
          }
        }
        
        if (matchedProfile) {
          console.log(`   ✅ Found match by ${matchMethod}: ${matchedProfile.full_name}`);
          console.log(`   📧 Email: ${matchedProfile.email}`);
          console.log(`   🆔 Correct user_id: ${matchedProfile.id}`);
          
          try {
            const { error: updateError } = await supabase
              .from('checklist_results')
              .update({
                user_id: matchedProfile.id,
                participant_name: matchedProfile.full_name,
                participant_ic: matchedProfile.ic,
                updated_at: new Date().toISOString()
              })
              .eq('id', result.id);
            
            if (updateError) {
              console.log(`   ❌ Update failed: ${updateError.message}`);
              checklistErrors++;
            } else {
              console.log(`   ✅ Updated successfully`);
              checklistFixed++;
            }
          } catch (error) {
            console.log(`   ❌ Unexpected error: ${error.message}`);
            checklistErrors++;
          }
        } else {
          console.log(`   ❌ No matching profile found`);
          checklistErrors++;
        }
      }
      
      console.log(`\n📊 Checklist Results Fix Summary:`);
      console.log(`   ✅ Fixed: ${checklistFixed} results`);
      console.log(`   ❌ Errors: ${checklistErrors} results`);
    }
    
    // Final verification
    console.log('\n🔍 Final Verification...');
    console.log('=' .repeat(60));
    
    // Check quiz sessions
    const { data: finalQuizSessions, error: finalQuizError } = await supabase
      .from('quiz_sessions')
      .select('id, user_id, participant_name, participant_ic');
    
    if (!finalQuizError && finalQuizSessions) {
      const orphanedQuizCount = finalQuizSessions.filter(session => 
        !profileById.has(session.user_id)
      ).length;
      
      console.log(`📊 Quiz Sessions Status:`);
      console.log(`   Total sessions: ${finalQuizSessions.length}`);
      console.log(`   Valid sessions: ${finalQuizSessions.length - orphanedQuizCount}`);
      console.log(`   Orphaned sessions: ${orphanedQuizCount}`);
    }
    
    // Check checklist results
    const { data: finalChecklistResults, error: finalChecklistError } = await supabase
      .from('checklist_results')
      .select('id, user_id, participant_name, participant_ic');
    
    if (!finalChecklistError && finalChecklistResults) {
      const orphanedChecklistCount = finalChecklistResults.filter(result => 
        !profileById.has(result.user_id)
      ).length;
      
      console.log(`📊 Checklist Results Status:`);
      console.log(`   Total results: ${finalChecklistResults.length}`);
      console.log(`   Valid results: ${finalChecklistResults.length - orphanedChecklistCount}`);
      console.log(`   Orphaned results: ${orphanedChecklistCount}`);
    }
    
    // Overall summary
    const totalRecords = (finalQuizSessions?.length || 0) + (finalChecklistResults?.length || 0);
    const orphanedRecords = (finalQuizSessions?.filter(s => !profileById.has(s.user_id)).length || 0) + 
                           (finalChecklistResults?.filter(r => !profileById.has(r.user_id)).length || 0);
    const validRecords = totalRecords - orphanedRecords;
    
    console.log(`\n🎯 OVERALL STATUS:`);
    console.log(`   📊 Total records: ${totalRecords}`);
    console.log(`   ✅ Valid records: ${validRecords} (${((validRecords / totalRecords) * 100).toFixed(1)}%)`);
    console.log(`   ❌ Orphaned records: ${orphanedRecords} (${((orphanedRecords / totalRecords) * 100).toFixed(1)}%)`);
    
    if (orphanedRecords === 0) {
      console.log('\n🎉 PERFECT! All records are now consistent!');
      console.log('   ✅ All quiz sessions reference valid profiles');
      console.log('   ✅ All checklist results reference valid profiles');
      console.log('   ✅ Data integrity achieved');
      console.log('   ✅ Ready for application code updates');
    } else {
      console.log(`\n⚠️  ${orphanedRecords} records still need attention`);
      console.log('   These records could not be matched to existing profiles');
      console.log('   Consider deleting them or creating missing profiles');
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Run the fix
fixAllOrphanedRecords();
