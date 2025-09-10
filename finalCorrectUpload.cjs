// Upload using correct user ID from checklist_results table
const https = require('https');

const SUPABASE_URL = 'https://ymajroaavaptafmoqciq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

function makeRequest(url, options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ data: result, error: null, status: res.statusCode });
        } catch (e) {
          resolve({ data: null, error: e, status: res.statusCode });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function addMissingParticipants() {
  console.log('Adding missing participants with correct user ID...');
  
  // Use the working user ID from checklist_results
  const workingUserId = "1543357e-7c30-4f74-9b0f-333843e42a15";
  
  const participants = [
    { name: "GRACE RURAN NGILO", ic: "880708135196", oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
    { name: "AMIR LUQMAN", ic: "950623146647", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "SUHARMIE BIN SULAIMAN", ic: "850507135897", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "MISRAWATI BINTI MA AMAN", ic: "900512126138", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "MYRA ATHIRA BINTI OMAR", ic: "920529126298", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "SA\"DI BIN USOP", ic: "680924135151", oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
    { name: "WENDY CHANDI ANAK SAMPURAI", ic: "930519135552", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "NORLINA BINTI ALI", ic: "951128126360", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" }
  ];
  
  for (const p of participants) {
    console.log(`Adding ${p.name}...`);
    
    const checklists = [
      { type: 'one-man-cpr', result: p.oneManCpr },
      { type: 'two-man-cpr', result: p.twoManCpr },
      { type: 'adult-choking', result: p.adultChoking },
      { type: 'infant-choking', result: p.infantChoking },
      { type: 'infant-cpr', result: p.infantCpr }
    ];
    
    for (const checklist of checklists) {
      const isPass = checklist.result === 'PASS';
      const score = isPass ? 8 : 4;
      
      const { data, error, status } = await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }
      }, {
        user_id: workingUserId,
        participant_name: p.name,
        participant_ic: p.ic,
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
      
      if (error) {
        console.log(`❌ Error adding ${checklist.type}:`, error);
      } else {
        console.log(`✅ Added ${checklist.type}: ${checklist.result} (Status: ${status})`);
      }
    }
    
    console.log(`✅ Completed ${p.name}\n`);
  }
  
  console.log('🎉 All done!');
}

addMissingParticipants();
