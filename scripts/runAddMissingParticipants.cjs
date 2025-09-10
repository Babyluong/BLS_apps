// scripts/runAddMissingParticipants.cjs
// Run the script to add missing participants

const https = require('https');

// Supabase configuration
const SUPABASE_URL = 'https://ymajroaavaptafmoqciq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

// Missing participants data
const missingParticipants = [
  { name: "GRACE RURAN NGILO", ic: "850315126789", preTest: 14, postTest: 22, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "AMIR LUQMAN BIN MISKANI", ic: "870512126123", preTest: 25, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SUHARMIE BIN SULAIMAN", ic: "910715126234", preTest: 11, postTest: 23, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MISRAWATI MA AMAN", ic: "890623126789", preTest: 25, postTest: 29, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MYRA ATHIRA BINTI OMAR", ic: "880901126567", preTest: 19, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SA'DI BIN USOP", ic: "910715126234", preTest: 15, postTest: 14, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "WENDY CHANDI ANAK SAMPURAI", ic: "880901126567", preTest: 20, postTest: 25, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NORLINA BINTI ALI", ic: "840901136178", preTest: 20, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" }
];

// Helper function to make HTTP requests
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
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Main function to add missing participants
async function addMissingParticipants() {
  try {
    console.log('Starting to add missing participants...');
    console.log(`Adding ${missingParticipants.length} participants...`);
    
    for (const participant of missingParticipants) {
      console.log(`\nProcessing: ${participant.name}`);
      console.log(`IC: ${participant.ic}`);
      console.log(`Pre-test: ${participant.preTest}, Post-test: ${participant.postTest}`);
      console.log(`Results: 1M-CPR: ${participant.oneManCpr}, 2M-CPR: ${participant.twoManCpr}, Adult: ${participant.adultChoking}, Infant: ${participant.infantChoking}, Infant-CPR: ${participant.infantCpr}`);
    }
    
    console.log('\nNote: This script shows the data that would be added.');
    console.log('To actually add the participants, you need to implement the database operations.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
addMissingParticipants();
