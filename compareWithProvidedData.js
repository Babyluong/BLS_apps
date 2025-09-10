// compareWithProvidedData.js
// Compare database with provided IC data

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Provided data
const providedData = [
  { name: "ABDUL RAHMAN BIN MOHAMAD BADARUDDIN", ic: "960109035847" },
  { name: "Ahmmad Zaki Isamuddin Bin Mohamad", ic: "940819136687" },
  { name: "ALVIN DULAMIT", ic: "910522125429" },
  { name: "Amanda bulan sigar", ic: "840901136178" },
  { name: "Amir Luqman", ic: "950623146647" },
  { name: "ANGELINA RURAN SIGAR", ic: "790313136208" },
  { name: "AWANGKU MOHAMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK", ic: "950821136503" },
  { name: "CATHERINE JOHN", ic: "790820135146" },
  { name: "CHRISTINA PADIN", ic: "860121525488" },
  { name: "CHRISTINE KOW CHONG LI", ic: "911225125718" },
  { name: "ELSIE ANAK BITI", ic: "980912135458" },
  { name: "EMILY AKUP", ic: "820924135946" },
  { name: "Fairylicia Braim", ic: "960927136308" },
  { name: "FARIDAH BINTI KUNAS", ic: "830926125994" },
  { name: "Fizra ivy was", ic: "981108136016" },
  { name: "Grace Nyura anak Jambai", ic: "960222136244" },
  { name: "Grace Ruran Ngilo", ic: "880708135196" },
  { name: "IMANUEL G. KORO", ic: "940830126615" },
  { name: "JANIZA BINTI BUJANG", ic: "810409135520" },
  { name: "JOHARI BIN EPIN", ic: "980724125949" },
  { name: "KAMARIAH BINTI MOHAMAD ALI", ic: "810315135546" },
  { name: "MANSUR BIN MURNI", ic: "850410135583" },
  { name: "Methdiouse ak Silan", ic: "740227135051" },
  { name: "MISRAWATI BINTI MA AMAN", ic: "900512126138" },
  { name: "MOHAMAD FARIZZUL BIN JAYA", ic: "841116136003" },
  { name: "MOHAMMAD ANNAS BIN BOING", ic: "881028135349" },
  { name: "Muhd Zainul Izzat Bin Zainudin", ic: "930829136657" },
  { name: "MYRA ATHIRA BINTI OMAR", ic: "920529126298" },
  { name: "NADHIRAH BINTI MOHD HANAFIAH", ic: "980501115030" },
  { name: "NAZURAH BINTI ABDUL LATIP", ic: "911030136310" },
  { name: "NOR BAIZURAH BINTI MASLIM", ic: "941223136648" },
  { name: "NORFARAIN BINTI SARBINI@SALDAN", ic: "980627136064" },
  { name: "NORLINA BINTI ALI", ic: "951128126360" },
  { name: "norshela binti yusuf", ic: "850722135232" },
  { name: "Nur amanda belinda jarut", ic: "890916135624" },
  { name: "NURITA BINTI HANTIN", ic: "740709135492" },
  { name: "NURIZANIE BINTI SANEH", ic: "950728135098" },
  { name: "Nurmasliana Binti Ismail", ic: "901225136514" },
  { name: "NURUL HAZWANIE ABDULLAH", ic: "790825136156" },
  { name: "PRISCA ANAK RUE", ic: "940402135566" },
  { name: "RAJAMI BIN ABDUL HASHIM", ic: "700825135119" },
  { name: "Razamah Binti Dullah", ic: "721119135368" },
  { name: "RURAN SAUL", ic: "900612138742" },
  { name: "SA'DI BIN USOP", ic: "680924135151" },
  { name: "saudaah binti idang", ic: "830105135984" },
  { name: "Shahirul Aqmal bin Shaheedan", ic: "970430136459" },
  { name: "SHAHRULNIZAM BIN IBRAHIM", ic: "960401135909" },
  { name: "Shirley sebelt", ic: "710217135106" },
  { name: "SITI KHAIRUNISA BINTI ZALEK", ic: "920509135402" },
  { name: "Syamsul Hardy Bin Ramlan", ic: "921022136061" },
  { name: "TRACY JONAS", ic: "920303125954" },
  { name: "VOON KING FATT", ic: "961201136231" },
  { name: "Yong Ziling", ic: "970324105472" },
  { name: "SUHARMIE BIN SULAIMAN", ic: "850507135897" },
  { name: "MUHSINAH BINTI ABDUL SHOMAD", ic: "920408085506" },
  { name: "WENDY CHANDI ANAK SAMPURAI", ic: "930519135552" }
];

async function compareWithProvidedData() {
  console.log('🔍 Comparing Database with Provided Data\n');
  console.log('=' .repeat(60));
  
  try {
    // Get all profiles from database
    const { data: dbProfiles, error: dbError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, email, role')
      .order('full_name');
    
    if (dbError) {
      console.log(`❌ Error fetching database profiles: ${dbError.message}`);
      return;
    }
    
    console.log(`📊 Database profiles: ${dbProfiles.length}`);
    console.log(`📊 Provided profiles: ${providedData.length}`);
    
    // Create lookup maps
    const dbMap = new Map();
    dbProfiles.forEach(profile => {
      const normalizedName = profile.full_name.toUpperCase().trim();
      dbMap.set(normalizedName, profile);
    });
    
    const providedMap = new Map();
    providedData.forEach(item => {
      const normalizedName = item.name.toUpperCase().trim();
      providedMap.set(normalizedName, item);
    });
    
    // Find matches and discrepancies
    const matches = [];
    const discrepancies = [];
    const missingInDB = [];
    const missingInProvided = [];
    
    // Check provided data against database
    for (const [name, providedItem] of providedMap) {
      const dbProfile = dbMap.get(name);
      
      if (dbProfile) {
        if (dbProfile.ic === providedItem.ic) {
          matches.push({
            name: providedItem.name,
            ic: providedItem.ic,
            status: 'MATCH'
          });
        } else {
          discrepancies.push({
            name: providedItem.name,
            providedIC: providedItem.ic,
            dbIC: dbProfile.ic || 'NULL',
            dbProfile: dbProfile,
            status: 'DISCREPANCY'
          });
        }
      } else {
        missingInDB.push({
          name: providedItem.name,
          ic: providedItem.ic,
          status: 'MISSING_IN_DB'
        });
      }
    }
    
    // Check database profiles against provided data
    for (const [name, dbProfile] of dbMap) {
      if (!providedMap.has(name)) {
        missingInProvided.push({
          name: dbProfile.full_name,
          ic: dbProfile.ic || 'NULL',
          dbProfile: dbProfile,
          status: 'MISSING_IN_PROVIDED'
        });
      }
    }
    
    // Display results
    console.log('\n📊 COMPARISON RESULTS:');
    console.log('=' .repeat(60));
    console.log(`   ✅ Matches: ${matches.length}`);
    console.log(`   ⚠️  Discrepancies: ${discrepancies.length}`);
    console.log(`   ❌ Missing in DB: ${missingInDB.length}`);
    console.log(`   ❌ Missing in Provided: ${missingInProvided.length}`);
    
    // Show matches
    if (matches.length > 0) {
      console.log('\n✅ MATCHES:');
      console.log('=' .repeat(60));
      matches.slice(0, 10).forEach((match, index) => {
        console.log(`${index + 1}. ${match.name}: ${match.ic}`);
      });
      if (matches.length > 10) {
        console.log(`   ... and ${matches.length - 10} more matches`);
      }
    }
    
    // Show discrepancies
    if (discrepancies.length > 0) {
      console.log('\n⚠️  DISCREPANCIES:');
      console.log('=' .repeat(60));
      discrepancies.forEach((discrepancy, index) => {
        console.log(`${index + 1}. ${discrepancy.name}`);
        console.log(`   Provided IC: ${discrepancy.providedIC}`);
        console.log(`   Database IC: ${discrepancy.dbIC}`);
        console.log(`   Email: ${discrepancy.dbProfile.email}`);
        console.log('');
      });
    }
    
    // Show missing in DB
    if (missingInDB.length > 0) {
      console.log('\n❌ MISSING IN DATABASE:');
      console.log('=' .repeat(60));
      missingInDB.forEach((missing, index) => {
        console.log(`${index + 1}. ${missing.name}: ${missing.ic}`);
      });
    }
    
    // Show missing in provided data
    if (missingInProvided.length > 0) {
      console.log('\n❌ MISSING IN PROVIDED DATA:');
      console.log('=' .repeat(60));
      missingInProvided.forEach((missing, index) => {
        console.log(`${index + 1}. ${missing.name}: ${missing.ic}`);
      });
    }
    
    // Special focus on the IC conflict
    console.log('\n🔍 IC CONFLICT ANALYSIS:');
    console.log('=' .repeat(60));
    
    const awangkuProvided = providedData.find(p => 
      p.name.toUpperCase().includes('AWANGKU MOHAMAD ZULFAZLI')
    );
    const farizzulProvided = providedData.find(p => 
      p.name.toUpperCase().includes('MOHAMAD FARIZZUL')
    );
    
    if (awangkuProvided && farizzulProvided) {
      console.log(`✅ AWANGKU MOHAMAD ZULFAZLI should have IC: ${awangkuProvided.ic}`);
      console.log(`✅ MOHAMAD FARIZZUL BIN JAYA should have IC: ${farizzulProvided.ic}`);
      console.log('   This resolves the IC conflict!');
    }
    
    // Generate update script
    if (discrepancies.length > 0) {
      console.log('\n🔧 GENERATING UPDATE SCRIPT:');
      console.log('=' .repeat(60));
      console.log('The following updates are needed:');
      
      discrepancies.forEach((discrepancy, index) => {
        console.log(`${index + 1}. Update ${discrepancy.name}:`);
        console.log(`   From: ${discrepancy.dbIC} → To: ${discrepancy.providedIC}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Comparison failed:', error);
  }
}

// Run the comparison
compareWithProvidedData();
