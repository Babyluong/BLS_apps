// scripts/checkChecklistTable.cjs
// Check the checklist_results table specifically

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

async function checkChecklistTable() {
  try {
    console.log("🔍 Checking checklist_results table...\n");
    
    // Try to get all checklist results
    const { data: checklistResults, error: checklistError, status: checklistStatus, rawBody } = await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Status Code: ${checklistStatus}`);
    console.log(`Error: ${checklistError ? checklistError.message : 'None'}`);
    console.log(`Raw Response: ${rawBody ? rawBody.substring(0, 500) + '...' : 'None'}`);
    
    if (checklistError) {
      console.log(`❌ Error fetching checklist results: ${checklistError.message}`);
      console.log(`Full error:`, checklistError);
    } else {
      console.log(`✅ Found ${checklistResults ? checklistResults.length : 0} checklist results`);
      if (checklistResults && checklistResults.length > 0) {
        console.log("Sample checklist results:");
        checklistResults.slice(0, 5).forEach(result => {
          console.log(`  - ${result.participant_name}: ${result.checklist_type} - ${result.status}`);
        });
      }
    }

    // Try to get count only
    console.log("\n🔍 Trying count query...");
    const { data: countData, error: countError, status: countStatus, rawBody: countRawBody } = await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results?select=count`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Count Status: ${countStatus}`);
    console.log(`Count Error: ${countError ? countError.message : 'None'}`);
    console.log(`Count Raw: ${countRawBody ? countRawBody.substring(0, 200) + '...' : 'None'}`);

    // Try to get table info
    console.log("\n🔍 Trying table info...");
    const { data: tableInfo, error: tableError, status: tableStatus, rawBody: tableRawBody } = await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results?select=*&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Table Status: ${tableStatus}`);
    console.log(`Table Error: ${tableError ? tableError.message : 'None'}`);
    console.log(`Table Raw: ${tableRawBody ? tableRawBody.substring(0, 200) + '...' : 'None'}`);

  } catch (error) {
    console.error("❌ Error checking checklist table:", error);
  }
}

checkChecklistTable();
