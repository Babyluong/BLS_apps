// scripts/generateAll56ParticipantsProfiles.cjs
// Generate quiz sessions and checklist results for all 56 participants using profiles table

const https = require('https');

// Supabase configuration
const SUPABASE_URL = 'https://ymajroaavaptafmoqciq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

// Our 56 participants with their expected results
const participants = [
  { name: "NORLINA BINTI ALI", ic: "840901136178", preTest: 20, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "EMILY AKUP", ic: "840901136179", preTest: 20, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NURITA BINTI HANTIN", ic: "840901136180", preTest: 25, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MOHAMAD FARIZZUL BIN JAYA", ic: "840901136181", preTest: 25, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NUR AMANDA BELINDA JARUT", ic: "840901136182", preTest: 21, postTest: 24, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "GRACE RURAN NGILO", ic: "840901136183", preTest: 14, postTest: 22, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "RAZAMAH BINTI DULLAH", ic: "840901136184", preTest: 23, postTest: 25, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NURIZANIE BINTI SANEH", ic: "840901136185", preTest: 21, postTest: 26, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "FIZRA IVY WAS", ic: "840901136186", preTest: 17, postTest: 23, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "NURMASLIANA BINTI ISMAIL", ic: "840901136187", preTest: 19, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "NOR BAIZURAH BINTI MASLIM", ic: "840901136188", preTest: 15, postTest: 22, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "SHIRLEY SEBELT", ic: "840901136189", preTest: 24, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "AMIR LUQMAN BIN MISKANI", ic: "840901136190", preTest: 25, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NAZURAH BINTI ABDUL LATIP", ic: "840901136191", preTest: 28, postTest: 29, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NORSHELA BINTI YUSUF", ic: "840901136192", preTest: 18, postTest: 23, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SITI KHAIRUNISA BINTI ZALEK", ic: "840901136193", preTest: 22, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MANSUR BIN MURNI", ic: "840901136194", preTest: 20, postTest: 24, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "ELSIE ANAK BITI", ic: "840901136195", preTest: 24, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MARZUKI RAJANG", ic: "840901136196", preTest: 15, postTest: 26, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "SUHARMIE BIN SULAIMAN", ic: "840901136197", preTest: 11, postTest: 23, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "IMANUEL G. KORO", ic: "840901136198", preTest: 16, postTest: 24, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "ALVIN DULAMIT", ic: "840901136199", preTest: 27, postTest: 30, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MISRAWATI BINTI MA AMAN", ic: "840901136200", preTest: 25, postTest: 29, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "FAIRYLICIA BRAIM", ic: "840901136201", preTest: 23, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SAUDAAH BINTI IDANG", ic: "840901136202", preTest: 20, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MYRA ATHIRA BINTI OMAR", ic: "840901136203", preTest: 19, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "KAMARIAH BINTI MOHAMAD ALI", ic: "840901136204", preTest: 22, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MOHAMMAD ANNAS BIN BOING", ic: "840901136205", preTest: 25, postTest: 30, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "ABDUL RAHMAN BIN MOHAMAD BADARUDDIN", ic: "840901136206", preTest: 20, postTest: 25, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "CHRISTINA PADIN", ic: "840901136207", preTest: 13, postTest: 23, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "PRISCA ANAK RUE", ic: "840901136208", preTest: 22, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "JOHARI BIN EPIN", ic: "840901136209", preTest: 15, postTest: 24, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SHAHIRUL AQMAL BIN SHAHEEDAN", ic: "840901136210", preTest: 25, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "AHMAD ZAKI ISAMUDDIN BIN MOHAMAD", ic: "840901136211", preTest: 13, postTest: 21, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "JANIZA BINTI BUJANG", ic: "840901136212", preTest: 18, postTest: 29, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "TRACY JONAS", ic: "840901136213", preTest: 19, postTest: 26, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "ANGELINA RURAN SIGAR", ic: "840901136214", preTest: 14, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "CHRISTINE KOW CHONG LI", ic: "840901136215", preTest: 21, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "METHDIOUSE ANAK SILAN", ic: "840901136216", preTest: 9, postTest: 20, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SA'DI BIN USOP", ic: "840901136217", preTest: 15, postTest: 14, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "MUHD ZAINUL 'IZZAT BIN ZAINUDIN", ic: "840901136218", preTest: 21, postTest: 29, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "RURAN SAUL", ic: "840901136219", preTest: 17, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "RAJAMI BIN ABDUL HASHIM", ic: "840901136220", preTest: 10, postTest: 19, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "NADHIRAH BINTI MOHD HANAFIAH", ic: "840901136221", preTest: 17, postTest: 25, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NURUL HAZWANIE ABDULLAH", ic: "840901136222", preTest: 24, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "GRACE NYURA ANAK JAMBAI", ic: "840901136223", preTest: 19, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NORFARAIN BINTI SARBINI@SALDAN", ic: "840901136224", preTest: 24, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "AMANDA BULAN SIGAR", ic: "840901136225", preTest: 19, postTest: 20, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "CATHERINE JOHN", ic: "840901136226", preTest: 19, postTest: 26, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "AWANGKU MOHAMMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK", ic: "840901136227", preTest: 14, postTest: 22, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "VOON KING FATT", ic: "840901136228", preTest: 22, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "WENDY CHANDI ANAK SAMPURAI", ic: "840901136229", preTest: 20, postTest: 25, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MUHSINAH BINTI ABDUL SHOMAD", ic: "840901136230", preTest: 21, postTest: 26, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "FARIDAH BINTI KUNAS", ic: "840901136231", preTest: 23, postTest: 26, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "YONG ZILING", ic: "840901136232", preTest: 19, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SHAHRULNIZAM BIN IBRAHIM", ic: "840901136233", preTest: 20, postTest: 26, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" }
];

// Name mappings for variations found in the database
const nameMappings = {
  "AMIR LUQMAN BIN MISKANI": "AMIR LUQMAN",
  "MISRAWATI BINTI MA AMAN": "MISRAWATI BINTI MA AMAN",
  "AHMAD ZAKI ISAMUDDIN BIN MOHAMAD": "AHMMAD ZAKI ISAMUDDIN BIN MOHA",
  "METHDIOUSE ANAK SILAN": "METHDIOUSE AK SILAN",
  "MUHD ZAINUL 'IZZAT BIN ZAINUDIN": "MUHD ZAINUL IZZAT BIN ZAINUDIN",
  "AWANGKU MOHAMMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK": "AWANGKU MOHAMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK",
  "SA'DI BIN USOP": "SA\"DI BIN USOP"
};

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

// Generate random answers for quiz
function generateRandomAnswers(score, totalQuestions = 30) {
  const correctAnswers = Math.floor((score / 30) * totalQuestions);
  const answers = [];
  
  // Generate correct answers
  for (let i = 0; i < correctAnswers; i++) {
    answers.push(Math.floor(Math.random() * 4) + 1); // 1-4 for A-D
  }
  
  // Fill remaining with random answers
  while (answers.length < totalQuestions) {
    answers.push(Math.floor(Math.random() * 4) + 1);
  }
  
  // Shuffle the answers
  for (let i = answers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answers[i], answers[j]] = [answers[j], answers[i]];
  }
  
  return answers;
}

// Generate checklist details
function generateChecklistDetails(checklistType, isPassed) {
  const baseDetails = {
    'one-man-cpr': {
      performed: [
        "Check for responsiveness",
        "Call for help",
        "Open airway",
        "Check breathing",
        "Give 2 rescue breaths",
        "Start chest compressions",
        "Continue CPR cycle"
      ],
      notPerformed: isPassed ? [] : [
        "Check for responsiveness",
        "Call for help"
      ]
    },
    'two-man-cpr': {
      performed: isPassed ? [
        "Check for responsiveness",
        "Call for help",
        "Open airway",
        "Check breathing",
        "Give 2 rescue breaths",
        "Start chest compressions",
        "Continue CPR cycle with partner"
      ] : [
        "Check for responsiveness",
        "Call for help"
      ],
      notPerformed: isPassed ? [] : [
        "Open airway",
        "Check breathing",
        "Give rescue breaths",
        "Start chest compressions"
      ]
    },
    'adult-choking': {
      performed: isPassed ? [
        "Recognize choking signs",
        "Ask if they can speak",
        "Perform Heimlich maneuver",
        "Check if object is expelled",
        "Continue until successful"
      ] : [
        "Recognize choking signs"
      ],
      notPerformed: isPassed ? [] : [
        "Ask if they can speak",
        "Perform Heimlich maneuver"
      ]
    },
    'infant-choking': {
      performed: isPassed ? [
        "Recognize choking signs",
        "Support head and neck",
        "Give 5 back blows",
        "Turn over and give 5 chest thrusts",
        "Check if object is expelled",
        "Continue until successful"
      ] : [
        "Recognize choking signs"
      ],
      notPerformed: isPassed ? [] : [
        "Support head and neck",
        "Give back blows",
        "Give chest thrusts"
      ]
    },
    'infant-cpr': {
      performed: isPassed ? [
        "Check for responsiveness",
        "Call for help",
        "Open airway",
        "Check breathing",
        "Give 2 rescue breaths",
        "Start chest compressions with 2 fingers",
        "Continue CPR cycle"
      ] : [
        "Check for responsiveness"
      ],
      notPerformed: isPassed ? [] : [
        "Call for help",
        "Open airway",
        "Check breathing",
        "Give rescue breaths",
        "Start chest compressions"
      ]
    }
  };
  
  return baseDetails[checklistType] || { performed: [], notPerformed: [] };
}

// Get existing profiles from Supabase
async function getExistingProfiles() {
  try {
    console.log('📋 Fetching existing profiles from Supabase...');
    const response = await makeRequest(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.error) {
      throw new Error(`Failed to fetch profiles: ${response.error.message}`);
    }
    
    console.log(`✅ Found ${response.data.length} profiles in database`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching profiles:', error.message);
    throw error;
  }
}

// Find user by name with fuzzy matching
function findUserByName(participant, existingProfiles) {
  const participantName = participant.name.trim();
  
  // Try exact match first
  let user = existingProfiles.find(p => p.full_name && p.full_name.trim().toLowerCase() === participantName.toLowerCase());
  if (user) return user;
  
  // Try mapped name
  const mappedName = nameMappings[participantName];
  if (mappedName) {
    user = existingProfiles.find(p => p.full_name && p.full_name.trim().toLowerCase() === mappedName.toLowerCase());
    if (user) return user;
  }
  
  // Try fuzzy matching
  user = existingProfiles.find(p => {
    if (!p.full_name) return false;
    const existingName = p.full_name.trim().toLowerCase();
    const searchName = participantName.toLowerCase();
    
    // Check if names contain each other (partial match)
    return existingName.includes(searchName.substring(0, 10)) || 
           searchName.includes(existingName.substring(0, 10));
  });
  
  return user;
}

// Generate quiz sessions for a participant
async function generateQuizSessions(participant, user) {
  const sessions = [];
  
  // Pre-test session
  const preTestAnswers = generateRandomAnswers(participant.preTest);
  const preTestSession = {
    user_id: user.id,
    quiz_type: 'pre_test',
    score: participant.preTest,
    total_questions: 30,
    answers: preTestAnswers,
    started_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random time in last week
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Expires in 24 hours
  };
  
  // Post-test session
  const postTestAnswers = generateRandomAnswers(participant.postTest);
  const postTestSession = {
    user_id: user.id,
    quiz_type: 'post_test',
    score: participant.postTest,
    total_questions: 30,
    answers: postTestAnswers,
    started_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
  
  try {
    // Insert pre-test
    const preTestResponse = await makeRequest(`${SUPABASE_URL}/rest/v1/quiz_sessions`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(preTestSession)
    });
    
    if (preTestResponse.error) {
      console.log(`❌ Failed to insert pre-test for ${participant.name}: ${preTestResponse.error.message}`);
    } else {
      console.log(`✅ Pre-test inserted for ${participant.name}: ${participant.preTest}/30`);
      sessions.push(preTestSession);
    }
    
    // Insert post-test
    const postTestResponse = await makeRequest(`${SUPABASE_URL}/rest/v1/quiz_sessions`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(postTestSession)
    });
    
    if (postTestResponse.error) {
      console.log(`❌ Failed to insert post-test for ${participant.name}: ${postTestResponse.error.message}`);
    } else {
      console.log(`✅ Post-test inserted for ${participant.name}: ${participant.postTest}/30`);
      sessions.push(postTestSession);
    }
    
  } catch (error) {
    console.error(`❌ Error generating quiz sessions for ${participant.name}:`, error.message);
  }
  
  return sessions;
}

// Generate checklist results for a participant
async function generateChecklistResults(participant, user) {
  const checklistTypes = ['one-man-cpr', 'two-man-cpr', 'adult-choking', 'infant-choking', 'infant-cpr'];
  const results = [];
  
  for (const checklistType of checklistTypes) {
    // Map checklist type to participant property
    let participantKey;
    switch (checklistType) {
      case 'one-man-cpr':
        participantKey = 'oneManCpr';
        break;
      case 'two-man-cpr':
        participantKey = 'twoManCpr';
        break;
      case 'adult-choking':
        participantKey = 'adultChoking';
        break;
      case 'infant-choking':
        participantKey = 'infantChoking';
        break;
      case 'infant-cpr':
        participantKey = 'infantCpr';
        break;
    }
    
    const isPassed = participant[participantKey] === 'PASS';
    const details = generateChecklistDetails(checklistType, isPassed);
    
    const checklistResult = {
      user_id: user.id,
      participant_name: participant.name,
      participant_ic: participant.ic,
      checklist_type: checklistType,
      score: isPassed ? Math.floor(Math.random() * 5) + 6 : Math.floor(Math.random() * 5), // 6-10 for pass, 0-4 for fail
      total_items: 10,
      status: isPassed ? 'PASS' : 'FAIL',
      checklist_details: details,
      comments: isPassed ? 'Well performed' : 'Needs improvement',
      duration_seconds: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
      assessment_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    try {
      const response = await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(checklistResult)
      });
      
      if (response.error) {
        console.log(`❌ Failed to insert ${checklistType} for ${participant.name}: ${response.error.message}`);
      } else {
        console.log(`✅ ${checklistType} inserted for ${participant.name}: ${isPassed ? 'PASS' : 'FAIL'}`);
        results.push(checklistResult);
      }
      
    } catch (error) {
      console.error(`❌ Error generating ${checklistType} for ${participant.name}:`, error.message);
    }
  }
  
  return results;
}

// Main function to generate all results
async function generateAllResults() {
  try {
    console.log('🚀 Starting data generation for 56 participants using profiles table...\n');
    
    // Get existing profiles
    const existingProfiles = await getExistingProfiles();
    
    let matchedCount = 0;
    let unmatchedCount = 0;
    let totalQuizSessions = 0;
    let totalChecklistResults = 0;
    
    console.log('\n📊 Processing participants...\n');
    
    for (const participant of participants) {
      const user = findUserByName(participant, existingProfiles);
      
      if (user) {
        console.log(`👤 Processing ${participant.name} -> ${user.full_name} (ID: ${user.id})`);
        matchedCount++;
        
        // Generate quiz sessions
        const quizSessions = await generateQuizSessions(participant, user);
        totalQuizSessions += quizSessions.length;
        
        // Generate checklist results
        const checklistResults = await generateChecklistResults(participant, user);
        totalChecklistResults += checklistResults.length;
        
        console.log(`✅ Completed ${participant.name}\n`);
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } else {
        console.log(`❌ No profile found for ${participant.name}`);
        unmatchedCount++;
      }
    }
    
    console.log('\n📈 Generation Summary:');
    console.log(`✅ Matched participants: ${matchedCount}/${participants.length}`);
    console.log(`❌ Unmatched participants: ${unmatchedCount}/${participants.length}`);
    console.log(`📝 Total quiz sessions created: ${totalQuizSessions}`);
    console.log(`📋 Total checklist results created: ${totalChecklistResults}`);
    
    if (unmatchedCount > 0) {
      console.log('\n❌ Unmatched participants:');
      participants.forEach(p => {
        const user = findUserByName(p, existingProfiles);
        if (!user) {
          console.log(`- ${p.name}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error in generateAllResults:', error.message);
  }
}

// Run the generation
generateAllResults();
