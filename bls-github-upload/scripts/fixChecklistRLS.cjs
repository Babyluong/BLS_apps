// scripts/fixChecklistRLS.cjs
// Script to help fix RLS issue and regenerate checklist data

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
          resolve({ data: result, error: null, status: res.statusCode });
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

// Test if we can insert into checklist_results
async function testChecklistInsert() {
  console.log("🧪 Testing checklist_results table access...");
  
  try {
    const testData = {
      user_id: "00000000-0000-0000-0000-000000000000", // Dummy UUID
      checklist_type: "test",
      participant_name: "TEST USER",
      participant_ic: "000000000000",
      status: "PASS",
      score: 100,
      total_items: 100,
      checklist_details: { test: true },
      comments: "Test insert",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error, status, rawBody } = await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    }, testData);

    if (error) {
      console.log(`❌ Checklist insert failed: ${error.message}`);
      console.log(`Status: ${status}`);
      console.log(`Raw response: ${rawBody}`);
      
      if (rawBody && rawBody.includes('RLS')) {
        console.log("\n🔒 ROW LEVEL SECURITY DETECTED!");
        console.log("The checklist_results table has RLS enabled, which blocks external inserts.");
        console.log("\n📋 TO FIX THIS:");
        console.log("1. Go to your Supabase Dashboard");
        console.log("2. Navigate to Authentication → Policies");
        console.log("3. Find the 'checklist_results' table");
        console.log("4. DISABLE RLS temporarily");
        console.log("5. Re-run this script");
        console.log("6. Re-enable RLS after data generation");
        return false;
      }
    } else {
      console.log("✅ Checklist insert successful - RLS is not blocking inserts");
      return true;
    }
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    return false;
  }
}

// Generate checklist results for all participants
async function generateChecklistResults() {
  console.log("\n📋 Generating checklist results...");
  
  // Get existing users
  const { data: users, error: userError } = await makeRequest(`${SUPABASE_URL}/rest/v1/users`, {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (userError) {
    console.log(`❌ Error fetching users: ${userError.message}`);
    return;
  }

  console.log(`📊 Found ${users.length} users in Supabase`);

  // All 56 participants with their exact results
  const participants = [
    { name: "NORLINA BINTI ALI", ic: "840901136178", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "EMILY AKUP", ic: "850315126789", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "NURITA BINTI HANTIN", ic: "860422137890", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "MOHAMAD FARIZZUL BIN JAYA", ic: "870503148901", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "NUR AMANDA BELINDA JARUT", ic: "880614159012", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "GRACE RURAN NGILO", ic: "890725160123", oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
    { name: "RAZAMAH BINTI DULLAH", ic: "900836171234", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "NURIZANIE BINTI SANEH", ic: "910947182345", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
    { name: "FIZRA IVY WAS", ic: "920158193456", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
    { name: "NURMASLIANA BINTI ISMAIL", ic: "930269204567", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
    { name: "NOR BAIZURAH BINTI MASLIM", ic: "940370215678", oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
    { name: "SHIRLEY SEBELT", ic: "950481226789", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "AMIR LUQMAN BIN MISKANI", ic: "960592237890", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "NAZURAH BINTI ABDUL LATIP", ic: "970603248901", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "NORSHELA BINTI YUSUF", ic: "980714259012", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "SITI KHAIRUNISA BINTI ZALEK", ic: "990825260123", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "MANSUR BIN MURNI", ic: "000936271234", oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
    { name: "ELSIE ANAK BITI", ic: "011047282345", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "MARZUKI RAJANG", ic: "021158293456", oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
    { name: "SUHARMIE BIN SULAIMAN", ic: "031269304567", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "IMANUEL G. KORO", ic: "041370315678", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "ALVIN DULAMIT", ic: "051481326789", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "MISRAWATI MA AMAN", ic: "061592337890", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "FAIRYLICIA BRAIM", ic: "071603348901", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "SAUDAAH BINTI IDANG", ic: "081714359012", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "MYRA ATHIRA BINTI OMAR", ic: "091825360123", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "KAMARIAH BINTI MOHAMAD ALI", ic: "101936371234", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "MOHAMMAD ANNAS BIN BOING", ic: "112047382345", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "ABDUL RAHMAN BIN MOHAMAD BADARUDDIN", ic: "122158393456", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "CHRISTINA PADIN", ic: "132269404567", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "PRISCA ANAK RUE", ic: "142370415678", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "JOHARI BIN EPIN", ic: "152481426789", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "SHAHIRUL AQMAL BIN SHAHEEDAN", ic: "162592437890", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "AHMAD ZAKI ISAMUDDIN BIN MOHAMAD", ic: "172603448901", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "JANIZA BINTI BUJANG", ic: "182714459012", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "TRACY JONAS", ic: "192825460123", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "ANGELINA RURAN SIGAR", ic: "202936471234", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "CHRISTINE KOW CHONG LI", ic: "213047482345", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "METHDIOUSE ANAK SILAN", ic: "223158493456", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "SA'DI BIN USOP", ic: "233269504567", oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
    { name: "MUHD ZAINUL 'IZZAT BIN ZAINUDIN", ic: "243370515678", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "RURAN SAUL", ic: "253481526789", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "RAJAMI BIN ABDUL HASHIM", ic: "263592537890", oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
    { name: "NADHIRAH BINTI MOHD HANAFIAH", ic: "273603548901", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "NURUL HAZWANIE ABDULLAH", ic: "283714559012", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "GRACE NYURA ANAK JAMBAI", ic: "293825560123", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "NORFARAIN BINTI SARBINI@SALDAN", ic: "303936571234", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "AMANDA BULAN SIGAR", ic: "314047582345", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "CATHERINE JOHN", ic: "324158593456", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "AWANGKU MOHAMMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK", ic: "334269604567", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "VOON KING FATT", ic: "344370615678", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "WENDY CHANDI ANAK SAMPURAI", ic: "354481626789", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "MUHSINAH BINTI ABDUL SHOMAD", ic: "364592637890", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "FARIDAH BINTI KUNAS", ic: "374603648901", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "YONG ZILING", ic: "384714659012", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
    { name: "SHAHRULNIZAM BIN IBRAHIM", ic: "394825660123", oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" }
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

  const checklistTypes = ['one-man-cpr', 'two-man-cpr', 'adult-choking', 'infant-choking', 'infant-cpr'];
  let successCount = 0;
  let failCount = 0;

  for (const participant of participants) {
    const user = findUserByName(participant, users);
    
    if (!user) {
      console.log(`❌ No user found for: ${participant.name}`);
      failCount++;
      continue;
    }
    
    console.log(`✅ Found user for: ${participant.name} -> ${user.full_name}`);
    
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
      const score = isPassed ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 60) + 20;
      
      const checklistDetails = {
        comments: `Generated ${checklistType} assessment`,
        timestamp: new Date().toISOString(),
        // Add specific checklist items based on type
        danger_ppe: Math.random() > 0.2,
        response_check: Math.random() > 0.2,
        airway_open: Math.random() > 0.2,
        breathing_technique: Math.random() > 0.2,
        compression_technique: Math.random() > 0.2
      };
      
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
          score: score,
          total_items: 100,
          checklist_details: checklistDetails,
          comments: `Generated ${checklistType} assessment`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        if (error) {
          console.log(`❌ Checklist error for ${participant.name} (${checklistType}):`, error.message);
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
async function main() {
  console.log("🔧 BLS Checklist RLS Fix Tool");
  console.log("================================\n");
  
  // Test if we can insert into checklist_results
  const canInsert = await testChecklistInsert();
  
  if (canInsert) {
    console.log("\n🚀 RLS is not blocking inserts. Generating checklist results...");
    await generateChecklistResults();
  } else {
    console.log("\n⏳ Please disable RLS on the checklist_results table and run this script again.");
  }
}

main();
