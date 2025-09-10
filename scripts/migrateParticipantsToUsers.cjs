// scripts/migrateParticipantsToUsers.cjs
// Script to migrate participants from quiz_sessions and checklist_results to users table

const https = require('https');

const SUPABASE_URL = 'https://ymajroaavaptafmoqciq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

function makeRequest(url, options, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ data: parsed, error: null });
        } catch (e) {
          resolve({ data: body, error: null });
        }
      });
    });

    req.on('error', (err) => reject(err));
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function migrateParticipantsToUsers() {
  console.log('🚀 Starting migration of participants to users table...\n');
  
  try {
    // Get all unique participants from quiz_sessions
    console.log('📊 Fetching participants from quiz_sessions...');
    const { data: quizSessions, error: quizError } = await makeRequest(`${SUPABASE_URL}/rest/v1/quiz_sessions?select=user_id,participant_name,participant_ic&status=eq.submitted`, {
      method: 'GET'
    });

    if (quizError) {
      console.log(`❌ Error fetching quiz sessions: ${quizError.message}`);
      return;
    }

    // Get all unique participants from checklist_results
    console.log('📊 Fetching participants from checklist_results...');
    const { data: checklistResults, error: checklistError } = await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results?select=user_id,participant_name,participant_ic&status=in.(PASS,FAIL)`, {
      method: 'GET'
    });

    if (checklistError) {
      console.log(`❌ Error fetching checklist results: ${checklistError.message}`);
      return;
    }

    // Combine and deduplicate participants
    const allParticipants = new Map();
    
    if (quizSessions) {
      quizSessions.forEach(session => {
        const key = `${session.participant_name}|${session.participant_ic}`;
        if (!allParticipants.has(key)) {
          allParticipants.set(key, {
            user_id: session.user_id,
            participant_name: session.participant_name,
            participant_ic: session.participant_ic,
            source: 'quiz_sessions'
          });
        }
      });
    }

    if (checklistResults) {
      checklistResults.forEach(result => {
        const key = `${result.participant_name}|${result.participant_ic}`;
        if (!allParticipants.has(key)) {
          allParticipants.set(key, {
            user_id: result.user_id,
            participant_name: result.participant_name,
            participant_ic: result.participant_ic,
            source: 'checklist_results'
          });
        } else {
          // Update source to show both
          const existing = allParticipants.get(key);
          existing.source = existing.source + ', checklist_results';
        }
      });
    }

    console.log(`📋 Found ${allParticipants.size} unique participants`);

    // Get existing users
    console.log('👥 Fetching existing users...');
    const { data: existingUsers, error: usersError } = await makeRequest(`${SUPABASE_URL}/rest/v1/users?select=id,full_name,ic`, {
      method: 'GET'
    });

    if (usersError) {
      console.log(`❌ Error fetching users: ${usersError.message}`);
      return;
    }

    console.log(`👥 Found ${existingUsers.length} existing users`);

    // Find participants that don't exist in users table
    const missingParticipants = [];
    const existingUserIds = new Set(existingUsers.map(u => u.id));
    const existingUserNames = new Set(existingUsers.map(u => u.full_name?.toUpperCase()));
    const existingUserIcs = new Set(existingUsers.map(u => u.ic));

    allParticipants.forEach((participant, key) => {
      const isMissing = !existingUserIds.has(participant.user_id) && 
                       !existingUserNames.has(participant.participant_name?.toUpperCase()) &&
                       !existingUserIcs.has(participant.participant_ic);
      
      if (isMissing) {
        missingParticipants.push(participant);
      }
    });

    console.log(`\n⚠️ Found ${missingParticipants.length} participants missing from users table:`);
    missingParticipants.forEach((participant, index) => {
      console.log(`  ${index + 1}. ${participant.participant_name} (${participant.participant_ic}) - User ID: ${participant.user_id}`);
      console.log(`     Source: ${participant.source}`);
    });

    if (missingParticipants.length === 0) {
      console.log('✅ All participants already exist in users table!');
      return;
    }

    // Create missing users
    console.log('\n🔧 Creating missing users...');
    let createdCount = 0;
    let errorCount = 0;

    for (const participant of missingParticipants) {
      try {
        // Create a basic user entry
        const userData = {
          id: participant.user_id, // Use the existing user_id from quiz/checklist
          full_name: participant.participant_name,
          ic: participant.participant_ic,
          email: `${participant.participant_ic}@hospital-lawas.local`,
          jawatan: 'N/A - To be updated', // Placeholder
          tempat_bertugas: 'Hospital Lawas', // Default
          bls_last_year: null,
          alergik: false,
          alergik_details: null,
          asma: false,
          hamil: false,
          hamil_weeks: null,
          phone_number: null
        };

        const { error: insertError } = await makeRequest(`${SUPABASE_URL}/rest/v1/users`, {
          method: 'POST',
          headers: {
            'Prefer': 'return=minimal'
          }
        }, userData);

        if (insertError) {
          console.log(`❌ Error creating user ${participant.participant_name}: ${insertError.message}`);
          errorCount++;
        } else {
          console.log(`✅ Created user: ${participant.participant_name} (${participant.participant_ic})`);
          createdCount++;
        }
      } catch (error) {
        console.log(`❌ Error creating user ${participant.participant_name}: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`  ✅ Created: ${createdCount} users`);
    console.log(`  ❌ Errors: ${errorCount} users`);
    console.log(`  📋 Total processed: ${missingParticipants.length} participants`);

    if (createdCount > 0) {
      console.log('\n💡 Next steps:');
      console.log('1. Update the jawatan field for the newly created users');
      console.log('2. Verify the BLS results screen now shows proper jawatan data');
      console.log('3. Run the fixMissingJawatan.cjs script to check for any remaining issues');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the migration
migrateParticipantsToUsers();
