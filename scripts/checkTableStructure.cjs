// scripts/checkTableStructure.cjs
// Check the table structure and foreign key constraints

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
    
    req.end();
  });
}

async function checkTableStructure() {
  try {
    console.log("🔍 Checking table structure and foreign key constraints...\n");
    
    // Check what tables exist
    console.log("📋 Checking available tables...");
    const { data: tables, error: tablesError } = await makeRequest(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (tablesError) {
      console.log(`❌ Error getting tables: ${tablesError.message}`);
    } else {
      console.log("Available tables:", Object.keys(tables || {}));
    }

    // Check users table
    console.log("\n👥 Checking users table...");
    const { data: users, error: usersError } = await makeRequest(`${SUPABASE_URL}/rest/v1/users?limit=3`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (usersError) {
      console.log(`❌ Error getting users: ${usersError.message}`);
    } else {
      console.log(`✅ Found ${users ? users.length : 0} users`);
      if (users && users.length > 0) {
        console.log("Sample user:", users[0]);
        console.log("User ID:", users[0].id);
        console.log("User ID type:", typeof users[0].id);
      }
    }

    // Check profiles table
    console.log("\n👤 Checking profiles table...");
    const { data: profiles, error: profilesError } = await makeRequest(`${SUPABASE_URL}/rest/v1/profiles?limit=3`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (profilesError) {
      console.log(`❌ Error getting profiles: ${profilesError.message}`);
    } else {
      console.log(`✅ Found ${profiles ? profiles.length : 0} profiles`);
      if (profiles && profiles.length > 0) {
        console.log("Sample profile:", profiles[0]);
        console.log("Profile ID:", profiles[0].id);
        console.log("Profile ID type:", typeof profiles[0].id);
      }
    }

    // Check auth.users table (if accessible)
    console.log("\n🔐 Checking auth.users table...");
    const { data: authUsers, error: authUsersError } = await makeRequest(`${SUPABASE_URL}/rest/v1/auth/users?limit=3`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (authUsersError) {
      console.log(`❌ Error getting auth.users: ${authUsersError.message}`);
    } else {
      console.log(`✅ Found ${authUsers ? authUsers.length : 0} auth users`);
      if (authUsers && authUsers.length > 0) {
        console.log("Sample auth user:", authUsers[0]);
        console.log("Auth User ID:", authUsers[0].id);
        console.log("Auth User ID type:", typeof authUsers[0].id);
      }
    }

    // Try to get table schema information
    console.log("\n📊 Checking checklist_results table structure...");
    const { data: checklistSchema, error: checklistSchemaError } = await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results?select=*&limit=0`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (checklistSchemaError) {
      console.log(`❌ Error getting checklist schema: ${checklistSchemaError.message}`);
    } else {
      console.log("Checklist results table accessible");
    }

    // Check if there are any existing checklist results
    console.log("\n📋 Checking existing checklist results...");
    const { data: existingChecklist, error: existingChecklistError } = await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results?limit=5`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (existingChecklistError) {
      console.log(`❌ Error getting existing checklist: ${existingChecklistError.message}`);
    } else {
      console.log(`✅ Found ${existingChecklist ? existingChecklist.length : 0} existing checklist results`);
      if (existingChecklist && existingChecklist.length > 0) {
        console.log("Sample checklist result:", existingChecklist[0]);
      }
    }

    // Test foreign key constraint with both user IDs
    console.log("\n🔗 Testing foreign key constraint...");
    
    if (users && users.length > 0 && profiles && profiles.length > 0) {
      const userId = users[0].id;
      const profileId = profiles[0].id;
      
      console.log(`Testing with users table ID: ${userId}`);
      const { data: testUsersData, error: testUsersError } = await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: userId,
          checklist_type: 'one-man-cpr',
          is_passed: true,
          details: { test: 'foreign key test' }
        })
      });
      
      if (testUsersError) {
        console.log('❌ Foreign key constraint failed with users table ID:', testUsersError.message);
      } else {
        console.log('✅ Foreign key constraint satisfied with users table ID');
        // Clean up test record
        await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results?user_id=eq.${userId}&checklist_type=eq.one-man-cpr`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      console.log(`\nTesting with profiles table ID: ${profileId}`);
      const { data: testProfilesData, error: testProfilesError } = await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results`, {
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
          details: { test: 'foreign key test' }
        })
      });
      
      if (testProfilesError) {
        console.log('❌ Foreign key constraint failed with profiles table ID:', testProfilesError.message);
      } else {
        console.log('✅ Foreign key constraint satisfied with profiles table ID');
        // Clean up test record
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
    console.error("❌ Error checking table structure:", error);
  }
}

checkTableStructure();
