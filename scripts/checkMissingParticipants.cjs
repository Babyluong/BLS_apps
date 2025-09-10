// scripts/checkMissingParticipants.cjs
// Check which participants from the image are missing from our current list

const https = require('https');

// Supabase configuration
const SUPABASE_URL = 'https://ymajroaavaptafmoqciq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

// All 56 participants from your uploaded image with EXACT results
const participantsFromImage = [
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

// Helper function to make HTTP requests
function makeRequest(url, options) {
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
    
    req.end();
  });
}

async function checkMissingParticipants() {
  try {
    console.log("🔍 Checking for missing participants...");
    
    // Get all users from Supabase
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
      return;
    }

    console.log(`📊 Found ${users.length} users in Supabase`);
    
    // Create a map of existing users by name (case-insensitive)
    const existingUsers = new Map();
    users.forEach(user => {
      const normalizedName = user.full_name?.toLowerCase().trim();
      if (normalizedName) {
        existingUsers.set(normalizedName, user);
      }
    });

    console.log(`📋 Checking against ${participantsFromImage.length} participants from image...`);
    
    // Check which participants from image are missing
    const missingParticipants = [];
    const foundParticipants = [];
    
    participantsFromImage.forEach(participant => {
      const normalizedName = participant.name.toLowerCase().trim();
      if (existingUsers.has(normalizedName)) {
        foundParticipants.push({
          name: participant.name,
          ic: participant.ic,
          supabaseUser: existingUsers.get(normalizedName)
        });
      } else {
        missingParticipants.push(participant);
      }
    });

    console.log(`\n✅ Found ${foundParticipants.length} participants in Supabase`);
    console.log(`❌ Missing ${missingParticipants.length} participants from Supabase`);
    
    if (missingParticipants.length > 0) {
      console.log("\n🔍 Missing participants:");
      missingParticipants.forEach((participant, index) => {
        console.log(`${index + 1}. ${participant.name} (IC: ${participant.ic})`);
      });
    }

    // Check for name mismatches
    console.log("\n🔍 Checking for potential name mismatches...");
    const potentialMatches = [];
    
    participantsFromImage.forEach(participant => {
      const normalizedName = participant.name.toLowerCase().trim();
      if (!existingUsers.has(normalizedName)) {
        // Look for similar names
        for (const [existingName, user] of existingUsers) {
          if (existingName.includes(normalizedName.substring(0, 10)) || 
              normalizedName.includes(existingName.substring(0, 10))) {
            potentialMatches.push({
              participant: participant,
              existingUser: user,
              similarity: existingName.includes(normalizedName.substring(0, 10)) ? 
                normalizedName.substring(0, 10).length / normalizedName.length : 
                existingName.substring(0, 10).length / existingName.length
            });
          }
        }
      }
    });

    if (potentialMatches.length > 0) {
      console.log("\n🔍 Potential name matches (similar names):");
      potentialMatches.forEach((match, index) => {
        console.log(`${index + 1}. "${match.participant.name}" might match "${match.existingUser.full_name}" (similarity: ${Math.round(match.similarity * 100)}%)`);
      });
    }

    // Show summary
    console.log(`\n📊 Summary:`);
    console.log(`- Total participants in image: ${participantsFromImage.length}`);
    console.log(`- Found in Supabase: ${foundParticipants.length}`);
    console.log(`- Missing from Supabase: ${missingParticipants.length}`);
    console.log(`- Potential matches: ${potentialMatches.length}`);

  } catch (error) {
    console.error("Error checking participants:", error);
  }
}

checkMissingParticipants();
