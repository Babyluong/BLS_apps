// scripts/fixMissingJawatan.cjs
// Script to fix missing jawatan data by migrating from profiles to users table

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

async function checkMissingJawatan() {
  console.log('🔍 Checking for missing jawatan data...\n');
  
  try {
    // Get all users from users table
    const { data: users, error: usersError } = await makeRequest(`${SUPABASE_URL}/rest/v1/users?select=id,full_name,ic,jawatan`, {
      method: 'GET'
    });

    if (usersError) {
      console.log(`❌ Error fetching users: ${usersError.message}`);
      return;
    }

    console.log(`📊 Found ${users.length} users in users table`);

    // Get all profiles
    const { data: profiles, error: profilesError } = await makeRequest(`${SUPABASE_URL}/rest/v1/profiles?select=id,full_name,ic,role`, {
      method: 'GET'
    });

    if (profilesError) {
      console.log(`❌ Error fetching profiles: ${profilesError.message}`);
      return;
    }

    console.log(`📊 Found ${profiles.length} profiles in profiles table`);

    // Find users with missing jawatan
    const usersWithMissingJawatan = users.filter(user => 
      !user.jawatan || user.jawatan.trim() === ''
    );

    console.log(`\n⚠️ Found ${usersWithMissingJawatan.length} users with missing jawatan:`);
    usersWithMissingJawatan.forEach(user => {
      console.log(`  - ${user.full_name} (${user.ic}) - ID: ${user.id}`);
    });

    // Find profiles that might have jawatan data
    const profilesWithData = profiles.filter(profile => 
      profile.full_name && profile.ic && profile.role !== 'admin'
    );

    console.log(`\n📋 Found ${profilesWithData.length} profiles with data`);

    // Check for matches between users and profiles
    const matches = [];
    usersWithMissingJawatan.forEach(user => {
      const matchingProfile = profilesWithData.find(profile => 
        profile.id === user.id || 
        (profile.ic === user.ic && profile.full_name === user.full_name)
      );
      
      if (matchingProfile) {
        matches.push({
          user: user,
          profile: matchingProfile
        });
      }
    });

    console.log(`\n🔗 Found ${matches.length} potential matches between users and profiles`);

    if (matches.length > 0) {
      console.log('\n📝 Matches found:');
      matches.forEach((match, index) => {
        console.log(`  ${index + 1}. User: ${match.user.full_name} (${match.user.ic})`);
        console.log(`     Profile: ${match.profile.full_name} (${match.profile.ic}) - Role: ${match.profile.role}`);
        console.log(`     User ID: ${match.user.id}`);
        console.log('');
      });

      console.log('💡 Recommendations:');
      console.log('1. Check if these users should have jawatan data in the users table');
      console.log('2. If they are participants, add appropriate jawatan values');
      console.log('3. If they are admin users, consider filtering them out from BLS results');
      console.log('4. Run this script again after making changes to verify fixes');
    }

    // Check for admin users in the data
    const adminProfiles = profiles.filter(profile => profile.role === 'admin');
    console.log(`\n👑 Found ${adminProfiles.length} admin profiles:`);
    adminProfiles.forEach(admin => {
      console.log(`  - ${admin.full_name} (${admin.ic}) - ID: ${admin.id}`);
    });

    // Check if any admin users have BLS results
    const adminIds = adminProfiles.map(admin => admin.id);
    const { data: adminQuizSessions } = await makeRequest(`${SUPABASE_URL}/rest/v1/quiz_sessions?user_id=in.(${adminIds.join(',')})&select=user_id,participant_name,quiz_key`, {
      method: 'GET'
    });

    const { data: adminChecklistResults } = await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results?user_id=in.(${adminIds.join(',')})&select=user_id,participant_name,checklist_type`, {
      method: 'GET'
    });

    if (adminQuizSessions && adminQuizSessions.length > 0) {
      console.log(`\n⚠️ Found ${adminQuizSessions.length} quiz sessions from admin users:`);
      adminQuizSessions.forEach(session => {
        console.log(`  - ${session.participant_name} (${session.quiz_key}) - User ID: ${session.user_id}`);
      });
    }

    if (adminChecklistResults && adminChecklistResults.length > 0) {
      console.log(`\n⚠️ Found ${adminChecklistResults.length} checklist results from admin users:`);
      adminChecklistResults.forEach(result => {
        console.log(`  - ${result.participant_name} (${result.checklist_type}) - User ID: ${result.user_id}`);
      });
    }

    if ((adminQuizSessions && adminQuizSessions.length > 0) || (adminChecklistResults && adminChecklistResults.length > 0)) {
      console.log('\n💡 Recommendation: Consider filtering out admin users from BLS results display');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check
checkMissingJawatan();
