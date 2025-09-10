// fixLastOrphanedSession.js
// Fix the last remaining orphaned quiz session

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixLastOrphanedSession() {
  console.log('🔧 Fixing Last Orphaned Quiz Session\n');
  console.log('=' .repeat(60));
  
  try {
    // Get the specific orphaned session
    const orphanedSessionId = '31c6d767-d229-4a20-a0f1-b37c2c1fce55';
    
    console.log(`🔍 Fetching orphaned session: ${orphanedSessionId}`);
    
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('id, user_id, participant_name, participant_ic, quiz_key')
      .eq('id', orphanedSessionId)
      .single();
    
    if (sessionError) {
      console.log(`❌ Error fetching session: ${sessionError.message}`);
      return;
    }
    
    console.log(`   Participant: ${session.participant_name} (${session.participant_ic})`);
    console.log(`   Quiz Key: ${session.quiz_key}`);
    console.log(`   Current user_id: ${session.user_id}`);
    
    // Find the correct profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, email')
      .eq('ic', session.participant_ic)
      .single();
    
    if (profileError) {
      console.log(`❌ Error finding profile: ${profileError.message}`);
      return;
    }
    
    console.log(`   ✅ Found profile: ${profile.full_name}`);
    console.log(`   📧 Email: ${profile.email}`);
    console.log(`   🆔 Correct user_id: ${profile.id}`);
    
    // Check if there's already a session for this user and quiz_key
    console.log(`\n🔍 Checking for existing session...`);
    
    const { data: existingSessions, error: existingError } = await supabase
      .from('quiz_sessions')
      .select('id, user_id, quiz_key, status, started_at')
      .eq('user_id', profile.id)
      .eq('quiz_key', session.quiz_key);
    
    if (existingError) {
      console.log(`❌ Error checking existing sessions: ${existingError.message}`);
      return;
    }
    
    console.log(`   📊 Found ${existingSessions.length} existing sessions for this user and quiz`);
    
    if (existingSessions.length > 0) {
      console.log(`\n⚠️  Duplicate session detected!`);
      console.log(`   This user already has a session for quiz: ${session.quiz_key}`);
      
      existingSessions.forEach((existing, index) => {
        console.log(`   ${index + 1}. Session ${existing.id}:`);
        console.log(`      Status: ${existing.status}`);
        console.log(`      Started: ${existing.started_at}`);
      });
      
      console.log(`\n💡 Options:`);
      console.log(`   1. Delete the orphaned session (recommended)`);
      console.log(`   2. Update the orphaned session to a different quiz_key`);
      console.log(`   3. Keep both sessions (not recommended)`);
      
      // Delete the orphaned session since it's a duplicate
      console.log(`\n🗑️ Deleting orphaned session (duplicate)...`);
      
      const { error: deleteError } = await supabase
        .from('quiz_sessions')
        .delete()
        .eq('id', orphanedSessionId);
      
      if (deleteError) {
        console.log(`   ❌ Delete failed: ${deleteError.message}`);
      } else {
        console.log(`   ✅ Orphaned session deleted successfully`);
        console.log(`   🎉 Duplicate resolved!`);
      }
    } else {
      // No existing session, safe to update
      console.log(`\n✅ No existing session found, safe to update`);
      
      const { error: updateError } = await supabase
        .from('quiz_sessions')
        .update({
          user_id: profile.id,
          participant_name: profile.full_name,
          participant_ic: profile.ic,
          updated_at: new Date().toISOString()
        })
        .eq('id', orphanedSessionId);
      
      if (updateError) {
        console.log(`   ❌ Update failed: ${updateError.message}`);
      } else {
        console.log(`   ✅ Session updated successfully`);
      }
    }
    
    // Final verification
    console.log(`\n🔍 Final Verification...`);
    
    const { data: finalSessions, error: finalError } = await supabase
      .from('quiz_sessions')
      .select('id, user_id, participant_name, participant_ic');
    
    if (!finalError && finalSessions) {
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id');
      
      if (!profilesError && allProfiles) {
        const profileIds = new Set(allProfiles.map(p => p.id));
        const orphanedCount = finalSessions.filter(s => !profileIds.has(s.user_id)).length;
        
        console.log(`📊 Final Status:`);
        console.log(`   Total quiz sessions: ${finalSessions.length}`);
        console.log(`   Valid sessions: ${finalSessions.length - orphanedCount}`);
        console.log(`   Orphaned sessions: ${orphanedCount}`);
        
        if (orphanedCount === 0) {
          console.log(`\n🎉 PERFECT! All quiz sessions are now valid!`);
          console.log(`   ✅ 100% data consistency achieved`);
          console.log(`   ✅ All sessions reference valid profiles`);
          console.log(`   ✅ Ready for application code updates`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Run the fix
fixLastOrphanedSession();
