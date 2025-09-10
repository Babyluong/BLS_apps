// scripts/checkAuthUsers.cjs
// Check the auth.users table and profiles table to understand the user ID structure

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
          resolve({ data: result, error: null, status: res.statusCode, rawBody: body });
        } catch (e) {
          resolve({ data: null, error: e, status: res.statusCode, rawBody: body });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function checkAuthUsers() {
  try {
    console.log("🔍 Checking auth.users and profiles tables...\n");
    
    // Check profiles table (this is what the app uses)
    console.log("👤 Checking profiles table...");
    const profilesResponse = await makeRequest(`${SUPABASE_URL}/rest/v1/profiles?select=*&limit=10`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (profilesResponse.error) {
      console.log(`❌ Error getting profiles: ${profilesResponse.error.message}`);
    } else {
      console.log(`✅ Found ${profilesResponse.data.length} profiles`);
      if (profilesResponse.data.length > 0) {
        console.log("Sample profile:", profilesResponse.data[0]);
        console.log("Profile ID:", profilesResponse.data[0].id);
        console.log("Profile ID type:", typeof profilesResponse.data[0].id);
      }
    }

    // Check if we can access auth.users directly
    console.log("\n🔐 Checking auth.users table...");
    const authUsersResponse = await makeRequest(`${SUPABASE_URL}/rest/v1/auth/users?select=*&limit=10`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (authUsersResponse.error) {
      console.log(`❌ Error getting auth.users: ${authUsersResponse.error.message}`);
      console.log("Raw response:", authUsersResponse.rawBody);
    } else {
      console.log(`✅ Found ${authUsersResponse.data.length} auth users`);
      if (authUsersResponse.data.length > 0) {
        console.log("Sample auth user:", authUsersResponse.data[0]);
        console.log("Auth User ID:", authUsersResponse.data[0].id);
        console.log("Auth User ID type:", typeof authUsersResponse.data[0].id);
      }
    }

    // Check if profiles table has the 56 participants we need
    console.log("\n📋 Checking for our 56 participants in profiles table...");
    const allProfilesResponse = await makeRequest(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (allProfilesResponse.error) {
      console.log(`❌ Error getting all profiles: ${allProfilesResponse.error.message}`);
    } else {
      console.log(`✅ Found ${allProfilesResponse.data.length} total profiles`);
      
      // Look for some of our participants
      const participantNames = [
        'NORLINA BINTI ALI',
        'EMILY AKUP', 
        'NURITA BINTI HANTIN',
        'IMANUEL G. KORO',
        'MISRAWATI BINTI MA AMAN'
      ];
      
      console.log("\n🔍 Looking for specific participants:");
      participantNames.forEach(name => {
        const found = allProfilesResponse.data.find(p => 
          p.full_name && p.full_name.toLowerCase().includes(name.toLowerCase())
        );
        if (found) {
          console.log(`✅ Found ${name}: ${found.full_name} (ID: ${found.id})`);
        } else {
          console.log(`❌ Not found: ${name}`);
        }
      });
    }

    // Test inserting checklist result with profile ID
    if (profilesResponse.data && profilesResponse.data.length > 0) {
      console.log("\n🧪 Testing checklist insert with profile ID...");
      const profileId = profilesResponse.data[0].id;
      
      const testResponse = await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: profileId,
          checklist_type: 'one-man-cpr',
          is_passed: true,
          details: { test: 'profile ID test' }
        })
      });
      
      if (testResponse.error) {
        console.log('❌ Checklist insert failed with profile ID:', testResponse.error.message);
      } else {
        console.log('✅ Checklist insert succeeded with profile ID');
        // Clean up
        await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results?user_id=eq.${profileId}&checklist_type=eq.one-man-cpr`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        });
      }
    }

  } catch (error) {
    console.error("❌ Error checking auth users:", error);
  }
}

checkAuthUsers();
