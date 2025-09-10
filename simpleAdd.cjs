// Simple script to add missing participant results
const https = require('https');

const SUPABASE_URL = 'https://ymajroaavaptafmoqciq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

// Get user ID first
async function getUserId(ic) {
  const { data: users } = await makeRequest(`${SUPABASE_URL}/rest/v1/users?ic=eq.${ic}&select=id`, {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  return users?.[0]?.id;
}

function makeRequest(url, options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ data: result, error: null });
        } catch (e) {
          resolve({ data: null, error: e });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function addOneParticipant(name, ic, preTest, postTest, oneManCpr, twoManCpr, adultChoking, infantChoking, infantCpr) {
  console.log(`Adding ${name}...`);
  
  const userId = await getUserId(ic);
  if (!userId) {
    console.log(`❌ User not found: ${name}`);
    return;
  }
  
  // Add pre-test
  const preAnswers = {};
  for (let i = 1; i <= 30; i++) {
    preAnswers[`malay-${i}`] = i <= preTest ? 'A' : 'B';
  }
  
  await makeRequest(`${SUPABASE_URL}/rest/v1/quiz_sessions`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    }
  }, {
    user_id: userId,
    quiz_key: 'pretest',
    status: 'submitted',
    score: preTest,
    total_questions: 30,
    percentage: Math.round((preTest / 30) * 100),
    answers: preAnswers,
    participant_name: name,
    participant_ic: ic,
    started_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // Add post-test
  const postAnswers = {};
  for (let i = 1; i <= 30; i++) {
    postAnswers[`malay-${i}`] = i <= postTest ? 'A' : 'B';
  }
  postAnswers._selected_set = 'SET_A';
  
  await makeRequest(`${SUPABASE_URL}/rest/v1/quiz_sessions`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    }
  }, {
    user_id: userId,
    quiz_key: 'posttest',
    status: 'submitted',
    score: postTest,
    total_questions: 30,
    percentage: Math.round((postTest / 30) * 100),
    answers: postAnswers,
    participant_name: name,
    participant_ic: ic,
    started_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // Add checklist results
  const checklists = [
    { type: 'one-man-cpr', result: oneManCpr },
    { type: 'two-man-cpr', result: twoManCpr },
    { type: 'adult-choking', result: adultChoking },
    { type: 'infant-choking', result: infantChoking },
    { type: 'infant-cpr', result: infantCpr }
  ];
  
  for (const checklist of checklists) {
    const isPass = checklist.result === 'PASS';
    const score = isPass ? 8 : 4; // Simple scoring
    
    await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    }, {
      user_id: userId,
      participant_name: name,
      participant_ic: ic,
      checklist_type: checklist.type,
      score: score,
      total_items: 10,
      status: checklist.result,
      checklist_details: {
        performed: isPass ? ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8'] : ['item1', 'item2', 'item3', 'item4'],
        notPerformed: isPass ? [] : ['item5', 'item6', 'item7', 'item8', 'item9', 'item10']
      },
      comments: isPass ? 'Good performance' : 'Needs improvement',
      assessment_date: new Date().toISOString(),
      duration_seconds: 120
    });
  }
  
  console.log(`✅ Added ${name} - Pre: ${preTest}, Post: ${postTest}, Results: ${oneManCpr}/${twoManCpr}/${adultChoking}/${infantChoking}/${infantCpr}`);
}

async function main() {
  console.log('Adding missing participant results...');
  
  await addOneParticipant("GRACE RURAN NGILO", "880708135196", 14, 22, "FAIL", "FAIL", "PASS", "PASS", "FAIL");
  await addOneParticipant("AMIR LUQMAN", "950623146647", 25, 27, "PASS", "PASS", "PASS", "PASS", "PASS");
  await addOneParticipant("SUHARMIE BIN SULAIMAN", "850507135897", 11, 23, "PASS", "PASS", "PASS", "PASS", "PASS");
  await addOneParticipant("MISRAWATI BINTI MA AMAN", "900512126138", 25, 29, "PASS", "PASS", "PASS", "PASS", "PASS");
  await addOneParticipant("MYRA ATHIRA BINTI OMAR", "920529126298", 19, 27, "PASS", "PASS", "PASS", "PASS", "PASS");
  await addOneParticipant("SA\"DI BIN USOP", "680924135151", 15, 14, "FAIL", "FAIL", "PASS", "PASS", "FAIL");
  await addOneParticipant("WENDY CHANDI ANAK SAMPURAI", "930519135552", 20, 25, "PASS", "PASS", "PASS", "PASS", "PASS");
  await addOneParticipant("NORLINA BINTI ALI", "951128126360", 20, 28, "PASS", "PASS", "PASS", "PASS", "PASS");
  
  console.log('Done!');
}

main();
