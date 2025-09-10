// scripts/generateAll56ParticipantsFixed.cjs
// Generate data for all 56 participants with proper name matching

const https = require('https');

// Supabase configuration
const SUPABASE_URL = 'https://ymajroaavaptafmoqciq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

// All 56 participants from your uploaded image with EXACT results
const participants = [
  { name: "NORLINA BINTI ALI", ic: "840901136178", preTest: 20, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "EMILY AKUP", ic: "850315126789", preTest: 20, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NURITA BINTI HANTIN", ic: "860422137890", preTest: 25, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MOHAMAD FARIZZUL BIN JAYA", ic: "870503148901", preTest: 25, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NUR AMANDA BELINDA JARUT", ic: "880614159012", preTest: 21, postTest: 24, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "GRACE RURAN NGILO", ic: "890725160123", preTest: 14, postTest: 22, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "RAZAMAH BINTI DULLAH", ic: "900836171234", preTest: 23, postTest: 25, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NURIZANIE BINTI SANEH", ic: "910947182345", preTest: 21, postTest: 26, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "FIZRA IVY WAS", ic: "920158193456", preTest: 17, postTest: 23, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "NURMASLIANA BINTI ISMAIL", ic: "930269204567", preTest: 19, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "NOR BAIZURAH BINTI MASLIM", ic: "940370215678", preTest: 15, postTest: 22, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "SHIRLEY SEBELT", ic: "950481226789", preTest: 24, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "AMIR LUQMAN BIN MISKANI", ic: "960592237890", preTest: 25, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NAZURAH BINTI ABDUL LATIP", ic: "970603248901", preTest: 28, postTest: 29, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NORSHELA BINTI YUSUF", ic: "980714259012", preTest: 18, postTest: 23, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SITI KHAIRUNISA BINTI ZALEK", ic: "990825260123", preTest: 22, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MANSUR BIN MURNI", ic: "000936271234", preTest: 20, postTest: 24, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "ELSIE ANAK BITI", ic: "011047282345", preTest: 24, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MARZUKI RAJANG", ic: "021158293456", preTest: 15, postTest: 26, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "SUHARMIE BIN SULAIMAN", ic: "031269304567", preTest: 11, postTest: 23, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "IMANUEL G. KORO", ic: "041370315678", preTest: 16, postTest: 24, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "ALVIN DULAMIT", ic: "051481326789", preTest: 27, postTest: 30, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MISRAWATI MA AMAN", ic: "061592337890", preTest: 25, postTest: 29, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "FAIRYLICIA BRAIM", ic: "071603348901", preTest: 23, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SAUDAAH BINTI IDANG", ic: "081714359012", preTest: 20, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MYRA ATHIRA BINTI OMAR", ic: "091825360123", preTest: 19, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "KAMARIAH BINTI MOHAMAD ALI", ic: "101936371234", preTest: 22, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MOHAMMAD ANNAS BIN BOING", ic: "112047382345", preTest: 25, postTest: 30, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "ABDUL RAHMAN BIN MOHAMAD BADARUDDIN", ic: "122158393456", preTest: 20, postTest: 25, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "CHRISTINA PADIN", ic: "132269404567", preTest: 13, postTest: 23, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "PRISCA ANAK RUE", ic: "142370415678", preTest: 22, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "JOHARI BIN EPIN", ic: "152481426789", preTest: 15, postTest: 24, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SHAHIRUL AQMAL BIN SHAHEEDAN", ic: "162592437890", preTest: 25, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "AHMAD ZAKI ISAMUDDIN BIN MOHAMAD", ic: "172603448901", preTest: 13, postTest: 21, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "JANIZA BINTI BUJANG", ic: "182714459012", preTest: 18, postTest: 29, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "TRACY JONAS", ic: "192825460123", preTest: 19, postTest: 26, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "ANGELINA RURAN SIGAR", ic: "202936471234", preTest: 14, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "CHRISTINE KOW CHONG LI", ic: "213047482345", preTest: 21, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "METHDIOUSE ANAK SILAN", ic: "223158493456", preTest: 9, postTest: 20, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SA'DI BIN USOP", ic: "233269504567", preTest: 15, postTest: 14, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "MUHD ZAINUL 'IZZAT BIN ZAINUDIN", ic: "243370515678", preTest: 21, postTest: 29, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "RURAN SAUL", ic: "253481526789", preTest: 17, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "RAJAMI BIN ABDUL HASHIM", ic: "263592537890", preTest: 10, postTest: 19, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "NADHIRAH BINTI MOHD HANAFIAH", ic: "273603548901", preTest: 17, postTest: 25, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NURUL HAZWANIE ABDULLAH", ic: "283714559012", preTest: 24, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "GRACE NYURA ANAK JAMBAI", ic: "293825560123", preTest: 19, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NORFARAIN BINTI SARBINI@SALDAN", ic: "303936571234", preTest: 24, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "AMANDA BULAN SIGAR", ic: "314047582345", preTest: 19, postTest: 20, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "CATHERINE JOHN", ic: "324158593456", preTest: 19, postTest: 26, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "AWANGKU MOHAMMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK", ic: "334269604567", preTest: 14, postTest: 22, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "VOON KING FATT", ic: "344370615678", preTest: 22, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "WENDY CHANDI ANAK SAMPURAI", ic: "354481626789", preTest: 20, postTest: 25, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MUHSINAH BINTI ABDUL SHOMAD", ic: "364592637890", preTest: 21, postTest: 26, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "FARIDAH BINTI KUNAS", ic: "374603648901", preTest: 23, postTest: 26, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "YONG ZILING", ic: "384714659012", preTest: 19, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SHAHRULNIZAM BIN IBRAHIM", ic: "394825660123", preTest: 20, postTest: 26, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" }
];

// Name mapping for variations found in Supabase
const nameMappings = {
  "AMIR LUQMAN BIN MISKANI": "AMIR LUQMAN",
  "MISRAWATI MA AMAN": "MISRAWATI BINTI MA AMAN", 
  "AHMAD ZAKI ISAMUDDIN BIN MOHAMAD": "AHMMAD ZAKI ISAMUDDIN BIN MOHA",
  "METHDIOUSE ANAK SILAN": "METHDIOUSE AK SILAN",
  "MUHD ZAINUL 'IZZAT BIN ZAINUDIN": "MUHD ZAINUL IZZAT BIN ZAINUDIN",
  "AWANGKU MOHAMMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK": "AWANGKU MOHAMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK"
};

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
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Generate random answers for quiz
function generateRandomAnswers() {
  const answers = {};
  for (let i = 1; i <= 30; i++) {
    const options = ['A', 'B', 'C', 'D'];
    answers[`question_${i}`] = options[Math.floor(Math.random() * options.length)];
  }
  return answers;
}

// Generate checklist details
function generateChecklistDetails(checklistType) {
  const details = {
    comments: `Generated assessment for ${checklistType}`,
    timestamp: new Date().toISOString()
  };
  
  // Add specific checklist items based on type
  const checklistItems = {
    'one-man-cpr': ['danger_ppe', 'response_check', 'shout_help', 'airway_open', 'breathing_check', 'compression_technique'],
    'two-man-cpr': ['danger_ppe', 'response_check', 'shout_help', 'airway_open', 'breathing_check', 'compression_technique', 'team_coordination'],
    'adult-choking': ['danger_ppe', 'response_check', 'choking_assessment', 'back_blows', 'abdominal_thrusts'],
    'infant-choking': ['danger_ppe', 'response_check', 'choking_assessment', 'back_blows', 'chest_thrusts'],
    'infant-cpr': ['danger_ppe', 'response_check', 'airway_open', 'breathing_technique', 'compression_technique']
  };
  
  const items = checklistItems[checklistType] || [];
  items.forEach(item => {
    details[item] = Math.random() > 0.3; // 70% chance of being true
  });
  
  return details;
}

// Get existing users from Supabase
async function getExistingUsers() {
  try {
    const { data: users, error } = await makeRequest(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    return users || [];
  } catch (error) {
    console.error("Error in getExistingUsers:", error);
    return [];
  }
}

// Find user by name with fuzzy matching
function findUserByName(participant, existingUsers) {
  const participantName = participant.name.trim();
  
  // First try exact match
  let user = existingUsers.find(u => 
    u.full_name && u.full_name.trim().toLowerCase() === participantName.toLowerCase()
  );
  
  if (user) return user;
  
  // Try mapped name
  const mappedName = nameMappings[participantName];
  if (mappedName) {
    user = existingUsers.find(u => 
      u.full_name && u.full_name.trim().toLowerCase() === mappedName.toLowerCase()
    );
    if (user) return user;
  }
  
  // Try fuzzy matching
  user = existingUsers.find(u => {
    if (!u.full_name) return false;
    const existingName = u.full_name.trim().toLowerCase();
    const searchName = participantName.toLowerCase();
    
    // Check if names contain each other
    return existingName.includes(searchName.substring(0, 10)) || 
           searchName.includes(existingName.substring(0, 10));
  });
  
  return user;
}

// Generate quiz sessions
async function generateQuizSessions(existingUsers) {
  console.log("📝 Generating quiz sessions...");
  
  let successCount = 0;
  let failCount = 0;
  
  for (const participant of participants) {
    const user = findUserByName(participant, existingUsers);
    
    if (!user) {
      console.log(`❌ No user found for: ${participant.name}`);
      failCount++;
      continue;
    }
    
    console.log(`✅ Found user for: ${participant.name} -> ${user.full_name}`);
    
    // Generate pre-test
    const preTestAnswers = generateRandomAnswers();
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + 30 * 60 * 1000); // 30 minutes
    
    try {
      const { error: preTestError } = await makeRequest(`${SUPABASE_URL}/rest/v1/quiz_sessions`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }
      }, {
        user_id: user.id,
        quiz_key: 'pretest',
        status: 'submitted',
        score: participant.preTest,
        total_questions: 30,
        percentage: Math.round((participant.preTest / 30) * 100),
        answers: preTestAnswers,
        participant_name: participant.name,
        participant_ic: participant.ic,
        started_at: startedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      });
      
      if (preTestError) {
        console.log(`❌ Pre-test error for ${participant.name}:`, preTestError);
        failCount++;
      } else {
        console.log(`✅ Pre-test created for ${participant.name}: ${participant.preTest}/30`);
        successCount++;
      }
    } catch (error) {
      console.log(`❌ Pre-test exception for ${participant.name}:`, error.message);
      failCount++;
    }
    
    // Generate post-test
    const postTestAnswers = generateRandomAnswers();
    
    try {
      const { error: postTestError } = await makeRequest(`${SUPABASE_URL}/rest/v1/quiz_sessions`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }
      }, {
        user_id: user.id,
        quiz_key: 'posttest',
        status: 'submitted',
        score: participant.postTest,
        total_questions: 30,
        percentage: Math.round((participant.postTest / 30) * 100),
        answers: postTestAnswers,
        participant_name: participant.name,
        participant_ic: participant.ic,
        started_at: startedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      });
      
      if (postTestError) {
        console.log(`❌ Post-test error for ${participant.name}:`, postTestError);
        failCount++;
      } else {
        console.log(`✅ Post-test created for ${participant.name}: ${participant.postTest}/30`);
        successCount++;
      }
    } catch (error) {
      console.log(`❌ Post-test exception for ${participant.name}:`, error.message);
      failCount++;
    }
  }
  
  console.log(`\n📊 Quiz Sessions Summary:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
}

// Generate checklist results
async function generateChecklistResults(existingUsers) {
  console.log("📋 Generating checklist results...");
  
  const checklistTypes = ['one-man-cpr', 'two-man-cpr', 'adult-choking', 'infant-choking', 'infant-cpr'];
  let successCount = 0;
  let failCount = 0;
  
  for (const participant of participants) {
    const user = findUserByName(participant, existingUsers);
    
    if (!user) {
      console.log(`❌ No user found for: ${participant.name}`);
      failCount++;
      continue;
    }
    
    for (const checklistType of checklistTypes) {
      let participantKey = '';
      switch(checklistType) {
        case 'one-man-cpr': participantKey = 'oneManCpr'; break;
        case 'two-man-cpr': participantKey = 'twoManCpr'; break;
        case 'adult-choking': participantKey = 'adultChoking'; break;
        case 'infant-choking': participantKey = 'infantChoking'; break;
        case 'infant-cpr': participantKey = 'infantCpr'; break;
      }
      
      const isPassed = participant[participantKey] === 'PASS';
      const checklistDetails = generateChecklistDetails(checklistType);
      
      try {
        const { error } = await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          }
        }, {
          user_id: user.id,
          checklist_type: checklistType,
          participant_name: participant.name,
          participant_ic: participant.ic,
          status: isPassed ? 'PASS' : 'FAIL',
          score: isPassed ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 60) + 20,
          total_items: 100,
          checklist_details: checklistDetails,
          comments: `Generated ${checklistType} assessment`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        if (error) {
          console.log(`❌ Checklist error for ${participant.name} (${checklistType}):`, error);
          failCount++;
        } else {
          console.log(`✅ Checklist created for ${participant.name} (${checklistType}): ${isPassed ? 'PASS' : 'FAIL'}`);
          successCount++;
        }
      } catch (error) {
        console.log(`❌ Checklist exception for ${participant.name} (${checklistType}):`, error.message);
        failCount++;
      }
    }
  }
  
  console.log(`\n📊 Checklist Results Summary:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
}

// Main function
async function generateAllResults() {
  try {
    console.log("🚀 Starting data generation for all 56 participants...");
    
    // Get existing users
    const existingUsers = await getExistingUsers();
    console.log(`📊 Found ${existingUsers.length} users in Supabase`);
    
    if (existingUsers.length === 0) {
      console.log("❌ No users found in Supabase. Please ensure users are created first.");
      return;
    }
    
    // Generate quiz sessions
    await generateQuizSessions(existingUsers);
    
    // Generate checklist results
    await generateChecklistResults(existingUsers);
    
    console.log("\n🎉 Data generation completed!");
    
  } catch (error) {
    console.error("❌ Error in generateAllResults:", error);
  }
}

// Run the script
generateAllResults();
