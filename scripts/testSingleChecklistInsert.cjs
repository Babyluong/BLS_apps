// scripts/testSingleChecklistInsert.cjs
// Test inserting a single checklist result and check what happens

const https = require('https');

// Supabase configuration
const SUPABASE_URL = 'https://ymajroaavaptafmoqciq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

// Helper function to make HTTP requests
function makeRequest(url, options, data = null) {
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
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testSingleInsert() {
  try {
    console.log("🧪 Testing single checklist insert...\n");
    
    // First, get a user ID
    const { data: users, error: userError } = await makeRequest(`${SUPABASE_URL}/rest/v1/users?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (userError || !users || users.length === 0) {
      console.log("❌ No users found");
      return;
    }

    const userId = users[0].id;
    console.log(`✅ Using user ID: ${userId} (${users[0].full_name})`);

    // Test insert
    const testData = {
      user_id: userId,
      checklist_type: 'one-man-cpr',
      participant_name: 'TEST USER',
      participant_ic: '123456789012',
      status: 'PASS',
      score: 95,
      total_items: 100,
      checklist_details: { test: true },
      comments: 'Test insert',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log("📝 Inserting test data...");
    const { data: insertResult, error: insertError, status: insertStatus, rawBody: insertRawBody } = await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    }, testData);

    console.log(`Insert Status: ${insertStatus}`);
    console.log(`Insert Error: ${insertError ? insertError.message : 'None'}`);
    console.log(`Insert Raw Response: ${insertRawBody ? insertRawBody.substring(0, 500) + '...' : 'None'}`);
    console.log(`Insert Result:`, insertResult);

    if (insertError) {
      console.log("❌ Insert failed");
      return;
    }

    // Wait a moment
    console.log("\n⏳ Waiting 2 seconds...");
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if the data was actually inserted
    console.log("🔍 Checking if data was inserted...");
    const { data: checkData, error: checkError, status: checkStatus, rawBody: checkRawBody } = await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results?participant_name=eq.TEST USER`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Check Status: ${checkStatus}`);
    console.log(`Check Error: ${checkError ? checkError.message : 'None'}`);
    console.log(`Check Raw: ${checkRawBody ? checkRawBody.substring(0, 500) + '...' : 'None'}`);
    console.log(`Found records: ${checkData ? checkData.length : 0}`);

    if (checkData && checkData.length > 0) {
      console.log("✅ Data was successfully inserted and can be retrieved!");
      console.log("Sample record:", checkData[0]);
    } else {
      console.log("❌ Data was not found after insert");
    }

  } catch (error) {
    console.error("❌ Error in test:", error);
  }
}

testSingleInsert();
