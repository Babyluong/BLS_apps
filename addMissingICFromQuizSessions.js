// addMissingICFromQuizSessions.js
// Add missing IC numbers from quiz_sessions table

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addMissingICFromQuizSessions() {
  console.log('🔍 Adding Missing IC Numbers from Quiz Sessions\n');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Get profiles without IC
    console.log('📋 Fetching profiles without IC...');
    
    const { data: profilesWithoutIC, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, email, role, created_at')
      .or('ic.is.null,ic.eq.')
      .order('full_name');
    
    if (profilesError) {
      console.log(`❌ Error fetching profiles: ${profilesError.message}`);
      return;
    }
    
    console.log(`   📊 Found ${profilesWithoutIC.length} profiles without IC`);
    
    // Step 2: Get all quiz sessions with IC data
    console.log('\n📋 Fetching quiz sessions with IC data...');
    
    const { data: quizSessions, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('id, user_id, participant_name, participant_ic')
      .not('participant_ic', 'is', null)
      .neq('participant_ic', '');
    
    if (quizError) {
      console.log(`❌ Error fetching quiz sessions: ${quizError.message}`);
      return;
    }
    
    console.log(`   📊 Found ${quizSessions.length} quiz sessions with IC data`);
    
    // Step 3: Match profiles with quiz sessions
    console.log('\n🔍 Matching profiles with quiz sessions...');
    
    const icMatches = [];
    const noMatches = [];
    
    for (const profile of profilesWithoutIC) {
      console.log(`\n👤 Checking: ${profile.full_name}`);
      console.log(`   Email: ${profile.email}`);
      
      // Try to match by name (case insensitive)
      const matchedSession = quizSessions.find(session => 
        session.participant_name && 
        session.participant_name.toUpperCase().trim() === profile.full_name.toUpperCase().trim()
      );
      
      if (matchedSession) {
        console.log(`   ✅ Found match in quiz session`);
        console.log(`   📝 IC: ${matchedSession.participant_ic}`);
        console.log(`   🆔 Session ID: ${matchedSession.id}`);
        
        // Validate IC format
        if (/^\d{12}$/.test(matchedSession.participant_ic)) {
          icMatches.push({
            profile: profile,
            session: matchedSession,
            ic: matchedSession.participant_ic
          });
        } else {
          console.log(`   ⚠️  Invalid IC format: ${matchedSession.participant_ic}`);
          noMatches.push({
            profile: profile,
            reason: `Invalid IC format: ${matchedSession.participant_ic}`
          });
        }
      } else {
        console.log(`   ❌ No matching quiz session found`);
        noMatches.push({
          profile: profile,
          reason: 'No matching quiz session'
        });
      }
    }
    
    // Step 4: Update profiles with IC numbers
    console.log('\n🔄 Updating profiles with IC numbers...');
    
    let successCount = 0;
    let errorCount = 0;
    const results = [];
    
    for (const match of icMatches) {
      console.log(`\n👤 Updating: ${match.profile.full_name}`);
      console.log(`   IC: ${match.ic}`);
      
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            ic: match.ic,
            updated_at: new Date().toISOString()
          })
          .eq('id', match.profile.id);
        
        if (updateError) {
          console.log(`   ❌ Update failed: ${updateError.message}`);
          results.push({
            name: match.profile.full_name,
            email: match.profile.email,
            status: 'UPDATE_ERROR',
            error: updateError.message,
            ic: match.ic
          });
          errorCount++;
        } else {
          console.log(`   ✅ IC added successfully: ${match.ic}`);
          results.push({
            name: match.profile.full_name,
            email: match.profile.email,
            status: 'SUCCESS',
            ic: match.ic
          });
          successCount++;
        }
        
      } catch (error) {
        console.log(`   ❌ Unexpected error: ${error.message}`);
        results.push({
          name: match.profile.full_name,
          email: match.profile.email,
          status: 'UNEXPECTED_ERROR',
          error: error.message,
          ic: match.ic
        });
        errorCount++;
      }
    }
    
    // Step 5: Summary
    console.log('\n📊 UPDATE SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`   ✅ Successfully updated: ${successCount} profiles`);
    console.log(`   ❌ Errors: ${errorCount} profiles`);
    console.log(`   📊 Total matches found: ${icMatches.length}`);
    console.log(`   📊 Total profiles processed: ${profilesWithoutIC.length}`);
    
    if (successCount > 0) {
      console.log('\n🎉 SUCCESS! IC numbers added:');
      console.log('=' .repeat(60));
      const successful = results.filter(r => r.status === 'SUCCESS');
      successful.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}: ${result.ic}`);
      });
    }
    
    if (errorCount > 0) {
      console.log('\n❌ ERRORS:');
      console.log('=' .repeat(60));
      const errors = results.filter(r => r.status !== 'SUCCESS');
      errors.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}: ${result.error}`);
      });
    }
    
    if (noMatches.length > 0) {
      console.log('\n⚠️  NO MATCHES FOUND:');
      console.log('=' .repeat(60));
      noMatches.forEach((noMatch, index) => {
        console.log(`${index + 1}. ${noMatch.profile.full_name}: ${noMatch.reason}`);
      });
    }
    
    // Step 6: Final verification
    console.log('\n🔍 Final verification...');
    
    const { data: finalProfiles, error: finalError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, email')
      .or('ic.is.null,ic.eq.')
      .order('full_name');
    
    if (finalError) {
      console.log(`❌ Error in final verification: ${finalError.message}`);
    } else {
      console.log(`   📊 Profiles still without IC: ${finalProfiles.length}`);
      
      if (finalProfiles.length > 0) {
        console.log('\n📋 Remaining profiles without IC:');
        finalProfiles.forEach((profile, index) => {
          console.log(`${index + 1}. ${profile.full_name} (${profile.email})`);
        });
      }
    }
    
    console.log('\n🔄 NEXT STEPS:');
    console.log('=' .repeat(60));
    console.log('1. ✅ IC numbers added from quiz sessions');
    console.log('2. 🧪 Test login functionality for updated profiles');
    console.log('3. 🔄 Consider manual IC addition for remaining profiles');
    console.log('4. 🎉 More users can now login with Name + IC');
    
  } catch (error) {
    console.error('❌ Process failed:', error);
  }
}

// Run the process
addMissingICFromQuizSessions();
