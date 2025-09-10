// scripts/verifyDataFixed.cjs
// Verify what data exists in Supabase

const https = require('https');

// Supabase configuration
const SUPABASE_URL = 'https://ymajroaavaptafmoqciq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

// Helper function to make HTTP requests
function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ data: result, error: null, status: res.statusCode });
        } catch (e) {
          resolve({ data: null, error: e, status: res.statusCode, rawBody: body });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.end();
  });
}

async function verifyData() {
  try {
    console.log("🔍 Verifying data in Supabase...\n");
    
    // Check quiz sessions
    console.log("📊 Quiz Sessions:");
    const { data: quizSessions, error: quizError, status: quizStatus } = await makeRequest(`${SUPABASE_URL}/rest/v1/quiz_sessions`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (quizError) {
      console.log(`❌ Error fetching quiz sessions: ${quizError.message}`);
      console.log(`Status: ${quizStatus}`);
      console.log(`Raw response: ${quizError.rawBody}`);
    } else {
      console.log(`✅ Found ${quizSessions.length} quiz sessions`);
      if (quizSessions.length > 0) {
        console.log("Sample quiz sessions:");
        quizSessions.slice(0, 5).forEach(session => {
          console.log(`  - ${session.participant_name}: ${session.quiz_key} (${session.score}/${session.total_questions}) - ${session.status}`);
        });
      }
    }

    // Check checklist results
    console.log("\n📋 Checklist Results:");
    const { data: checklistResults, error: checklistError, status: checklistStatus } = await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (checklistError) {
      console.log(`❌ Error fetching checklist results: ${checklistError.message}`);
      console.log(`Status: ${checklistStatus}`);
      console.log(`Raw response: ${checklistError.rawBody}`);
    } else {
      console.log(`✅ Found ${checklistResults.length} checklist results`);
      if (checklistResults.length > 0) {
        console.log("Sample checklist results:");
        checklistResults.slice(0, 5).forEach(result => {
          console.log(`  - ${result.participant_name}: ${result.checklist_type} - ${result.status}`);
        });
      }
    }

    // Check users
    console.log("\n👥 Users:");
    const { data: users, error: userError, status: userStatus } = await makeRequest(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (userError) {
      console.log(`❌ Error fetching users: ${userError.message}`);
      console.log(`Status: ${userStatus}`);
      console.log(`Raw response: ${userError.rawBody}`);
    } else {
      console.log(`✅ Found ${users.length} users`);
      if (users.length > 0) {
        console.log("Sample users:");
        users.slice(0, 5).forEach(user => {
          console.log(`  - ${user.full_name} (IC: ${user.ic})`);
        });
      }
    }

    // Check for recent data
    console.log("\n🔍 Checking for recent data...");
    const recentDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Last 24 hours
    
    const { data: recentQuiz, error: recentQuizError } = await makeRequest(`${SUPABASE_URL}/rest/v1/quiz_sessions?created_at=gte.${recentDate}`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (recentQuizError) {
      console.log(`❌ Error fetching recent quiz sessions: ${recentQuizError.message}`);
    } else {
      console.log(`📅 Recent quiz sessions (${recentDate}):`);
      if (Array.isArray(recentQuiz)) {
        console.log(`✅ Found ${recentQuiz.length} recent quiz sessions`);
        recentQuiz.slice(0, 3).forEach(session => {
          console.log(`  - ${session.participant_name}: ${session.quiz_key} (${session.score}/${session.total_questions})`);
        });
      } else {
        console.log(`❌ Recent quiz data is not an array:`, typeof recentQuiz);
      }
    }

    // Summary
    console.log("\n📊 Summary:");
    console.log(`- Quiz Sessions: ${quizSessions ? quizSessions.length : 0}`);
    console.log(`- Checklist Results: ${checklistResults ? checklistResults.length : 0}`);
    console.log(`- Users: ${users ? users.length : 0}`);
    console.log(`- Recent Quiz Sessions: ${Array.isArray(recentQuiz) ? recentQuiz.length : 0}`);

  } catch (error) {
    console.error("❌ Error verifying data:", error);
  }
}

verifyData();
