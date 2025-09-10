// fixOrphanedSessions.js
// Fix orphaned quiz sessions by matching them with correct profiles

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixOrphanedSessions() {
  console.log('🔧 Fixing Orphaned Quiz Sessions\n');
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
    
    // Get orphaned quiz sessions
    console.log('\n📋 Finding orphaned quiz sessions...');
    
    const { data: allQuizSessions, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('id, user_id, participant_name, participant_ic');
    
    if (quizError) {
      console.log(`❌ Error fetching quiz sessions: ${quizError.message}`);
      return;
    }
    
    console.log(`   📊 Found ${allQuizSessions.length} quiz sessions`);
    
    // Find orphaned sessions
    const orphanedSessions = allQuizSessions.filter(session => 
      !profileById.has(session.user_id)
    );
    
    console.log(`   🚫 Found ${orphanedSessions.length} orphaned sessions`);
    
    if (orphanedSessions.length === 0) {
      console.log('✅ No orphaned sessions found!');
      return;
    }
    
    // Try to match orphaned sessions with correct profiles
    console.log('\n🔍 Attempting to match orphaned sessions...');
    
    let matchedCount = 0;
    let unmatchedCount = 0;
    const matches = [];
    const unmatched = [];
    
    for (const session of orphanedSessions) {
      console.log(`\n👤 Processing session: ${session.id}`);
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
        
        matches.push({
          session: session,
          profile: matchedProfile,
          matchMethod: matchMethod
        });
        matchedCount++;
      } else {
        console.log(`   ❌ No matching profile found`);
        unmatched.push(session);
        unmatchedCount++;
      }
    }
    
    console.log(`\n📊 Matching Summary:`);
    console.log(`   ✅ Matched: ${matchedCount} sessions`);
    console.log(`   ❌ Unmatched: ${unmatchedCount} sessions`);
    
    // Update matched sessions
    if (matches.length > 0) {
      console.log('\n🔄 Updating matched sessions...');
      
      let updateSuccess = 0;
      let updateErrors = 0;
      
      for (const match of matches) {
        console.log(`\n👤 Updating session ${match.session.id}:`);
        console.log(`   From user_id: ${match.session.user_id}`);
        console.log(`   To user_id: ${match.profile.id}`);
        
        try {
          const { error: updateError } = await supabase
            .from('quiz_sessions')
            .update({
              user_id: match.profile.id,
              participant_name: match.profile.full_name,
              participant_ic: match.profile.ic,
              updated_at: new Date().toISOString()
            })
            .eq('id', match.session.id);
          
          if (updateError) {
            console.log(`   ❌ Update failed: ${updateError.message}`);
            updateErrors++;
          } else {
            console.log(`   ✅ Updated successfully`);
            updateSuccess++;
          }
        } catch (error) {
          console.log(`   ❌ Unexpected error: ${error.message}`);
          updateErrors++;
        }
      }
      
      console.log(`\n📊 Update Summary:`);
      console.log(`   ✅ Successfully updated: ${updateSuccess} sessions`);
      console.log(`   ❌ Update errors: ${updateErrors} sessions`);
    }
    
    // Show unmatched sessions
    if (unmatched.length > 0) {
      console.log('\n❌ UNMATCHED SESSIONS:');
      console.log('=' .repeat(60));
      unmatched.forEach((session, index) => {
        console.log(`${index + 1}. Session ${session.id}:`);
        console.log(`   Participant: ${session.participant_name} (${session.participant_ic})`);
        console.log(`   User ID: ${session.user_id}`);
      });
      
      console.log('\n💡 RECOMMENDATIONS:');
      console.log('1. Check if these participants exist in profiles table');
      console.log('2. Create missing profiles if needed');
      console.log('3. Delete orphaned sessions if they are invalid');
    }
    
    // Final verification
    console.log('\n🔍 Final Verification...');
    
    const { data: finalQuizSessions, error: finalQuizError } = await supabase
      .from('quiz_sessions')
      .select('id, user_id, participant_name, participant_ic');
    
    if (!finalQuizError && finalQuizSessions) {
      const orphanedCount = finalQuizSessions.filter(session => 
        !profileById.has(session.user_id)
      ).length;
      
      console.log(`📊 Final Quiz Sessions Status:`);
      console.log(`   Total sessions: ${finalQuizSessions.length}`);
      console.log(`   Orphaned sessions: ${orphanedCount}`);
      console.log(`   Valid sessions: ${finalQuizSessions.length - orphanedCount}`);
      
      if (orphanedCount === 0) {
        console.log('\n🎉 ALL SESSIONS ARE NOW VALID!');
        console.log('   ✅ No orphaned sessions remaining');
        console.log('   ✅ All sessions reference valid profiles');
        console.log('   ✅ Data consistency achieved');
      }
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Run the fix
fixOrphanedSessions();
