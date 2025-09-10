// scripts/checkAllProfiles.cjs
// Check all profiles and match them with our 56 participants

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

async function checkAllProfiles() {
  try {
    console.log("🔍 Checking all profiles and matching with our 56 participants...\n");
    
    // Get all profiles
    const profilesResponse = await makeRequest(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (profilesResponse.error) {
      console.log(`❌ Error getting profiles: ${profilesResponse.error.message}`);
      return;
    }
    
    const profiles = profilesResponse.data;
    console.log(`✅ Found ${profiles.length} total profiles\n`);
    
    // Match participants with profiles
    const matchedParticipants = [];
    const unmatchedParticipants = [];
    
    participants.forEach(participant => {
      const matchedProfile = profiles.find(profile => {
        if (!profile.full_name) return false;
        
        // Try exact match first
        if (profile.full_name.trim().toLowerCase() === participant.name.toLowerCase()) {
          return true;
        }
        
        // Try partial match (first 10 characters)
        const profileName = profile.full_name.trim().toLowerCase();
        const participantName = participant.name.toLowerCase();
        return profileName.includes(participantName.substring(0, 10)) || 
               participantName.includes(profileName.substring(0, 10));
      });
      
      if (matchedProfile) {
        matchedParticipants.push({
          participant: participant,
          profile: matchedProfile
        });
      } else {
        unmatchedParticipants.push(participant);
      }
    });
    
    console.log(`✅ Matched ${matchedParticipants.length} participants`);
    console.log(`❌ Unmatched ${unmatchedParticipants.length} participants\n`);
    
    // Show matched participants
    console.log("📋 Matched participants:");
    matchedParticipants.forEach((match, index) => {
      console.log(`${index + 1}. ${match.participant.name} -> ${match.profile.full_name} (ID: ${match.profile.id})`);
    });
    
    // Show unmatched participants
    if (unmatchedParticipants.length > 0) {
      console.log("\n❌ Unmatched participants:");
      unmatchedParticipants.forEach((participant, index) => {
        console.log(`${index + 1}. ${participant.name}`);
      });
    }
    
    // Show all profile names for reference
    console.log("\n📋 All profile names in database:");
    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.full_name || 'No name'} (ID: ${profile.id})`);
    });
    
  } catch (error) {
    console.error("❌ Error checking profiles:", error);
  }
}

checkAllProfiles();
