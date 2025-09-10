// findICFromQuizSessions.js
// Find IC numbers from quiz_sessions table for missing profiles

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function findICFromQuizSessions() {
  console.log('🔍 Finding IC Numbers from Quiz Sessions\n');
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
    
    // Step 2: Get all quiz sessions
    console.log('\n📋 Fetching quiz sessions...');
    
    const { data: quizSessions, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .order('created_at');
    
    if (quizError) {
      console.log(`❌ Error fetching quiz sessions: ${quizError.message}`);
      return;
    }
    
    console.log(`   📊 Found ${quizSessions.length} quiz sessions`);
    
    // Step 3: Analyze quiz session structure
    console.log('\n🔍 Analyzing quiz session structure...');
    
    if (quizSessions.length > 0) {
      const sampleSession = quizSessions[0];
      const columns = Object.keys(sampleSession);
      
      console.log('   📋 Quiz session columns:');
      columns.forEach((column, index) => {
        const value = sampleSession[column];
        console.log(`   ${index + 1}. ${column}: ${typeof value} - "${value}"`);
      });
    }
    
    // Step 4: Try to match profiles with quiz sessions
    console.log('\n🔍 Matching profiles with quiz sessions...');
    
    const icMatches = [];
    const noMatches = [];
    
    for (const profile of profilesWithoutIC) {
      console.log(`\n👤 Checking: ${profile.full_name}`);
      console.log(`   Email: ${profile.email}`);
      
      // Try different matching strategies
      let matchedSession = null;
      let matchMethod = '';
      
      // Strategy 1: Match by full name
      matchedSession = quizSessions.find(session => 
        session.participant_name && 
        session.participant_name.toUpperCase() === profile.full_name.toUpperCase()
      );
      if (matchedSession) {
        matchMethod = 'participant_name';
      }
      
      // Strategy 2: Match by email (if email exists in quiz session)
      if (!matchedSession && session.participant_email) {
        matchedSession = quizSessions.find(session => 
          session.participant_email === profile.email
        );
        if (matchedSession) {
          matchMethod = 'participant_email';
        }
      }
      
      // Strategy 3: Match by IC (if IC exists in quiz session)
      if (!matchedSession && session.participant_ic) {
        matchedSession = quizSessions.find(session => 
          session.participant_ic && 
          session.participant_ic.trim() !== ''
        );
        if (matchedSession) {
          matchMethod = 'participant_ic';
        }
      }
      
      if (matchedSession) {
        console.log(`   ✅ Found match via ${matchMethod}`);
        console.log(`   📝 IC: ${matchedSession.participant_ic || 'N/A'}`);
        console.log(`   📧 Email: ${matchedSession.participant_email || 'N/A'}`);
        console.log(`   👤 Name: ${matchedSession.participant_name || 'N/A'}`);
        
        if (matchedSession.participant_ic && matchedSession.participant_ic.trim() !== '') {
          icMatches.push({
            profile: profile,
            session: matchedSession,
            ic: matchedSession.participant_ic.trim(),
            matchMethod: matchMethod
          });
        } else {
          console.log(`   ⚠️  No IC found in matched session`);
          noMatches.push({
            profile: profile,
            session: matchedSession,
            reason: 'No IC in matched session'
          });
        }
      } else {
        console.log(`   ❌ No matching quiz session found`);
        noMatches.push({
          profile: profile,
          session: null,
          reason: 'No matching session'
        });
      }
    }
    
    // Step 5: Summary
    console.log('\n📊 MATCHING SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`   ✅ Found IC matches: ${icMatches.length}`);
    console.log(`   ❌ No matches: ${noMatches.length}`);
    console.log(`   📊 Total profiles: ${profilesWithoutIC.length}`);
    
    if (icMatches.length > 0) {
      console.log('\n🎉 IC MATCHES FOUND:');
      console.log('=' .repeat(60));
      icMatches.forEach((match, index) => {
        console.log(`${index + 1}. ${match.profile.full_name}`);
        console.log(`   IC: ${match.ic}`);
        console.log(`   Match method: ${match.matchMethod}`);
        console.log(`   Session ID: ${match.session.id}`);
        console.log('');
      });
    }
    
    if (noMatches.length > 0) {
      console.log('\n❌ NO MATCHES FOUND:');
      console.log('=' .repeat(60));
      noMatches.forEach((noMatch, index) => {
        console.log(`${index + 1}. ${noMatch.profile.full_name}`);
        console.log(`   Reason: ${noMatch.reason}`);
        console.log('');
      });
    }
    
    // Step 6: Generate update script
    if (icMatches.length > 0) {
      console.log('\n🔧 GENERATING UPDATE SCRIPT:');
      console.log('=' .repeat(60));
      console.log('Copy this data to addMissingICNumbers.js:');
      console.log('');
      console.log('const missingICData = [');
      icMatches.forEach((match, index) => {
        console.log(`  { name: "${match.profile.full_name}", ic: "${match.ic}" }${index < icMatches.length - 1 ? ',' : ''}`);
      });
      console.log('];');
    }
    
  } catch (error) {
    console.error('❌ Process failed:', error);
  }
}

// Run the process
findICFromQuizSessions();
