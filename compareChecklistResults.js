// compareChecklistResults.js - Compare provided results with database checklist_results
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

// Provided results data
const providedResults = [
  { name: "NORLINA BINTI ALI", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "EMILY AKUP", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NURITA BINTI HANTIN", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MOHAMAD FARIZZUL BIN JAYA", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NUR AMANDA BELINDA JARUT", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "GRACE RURAN NGILO", oneMan: "FAIL", twoMan: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "RAZAMAH BINTI DULLAH", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NURIZANIE BINTI SANEH", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "FIZRA IVY WAS", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "NURMASLIANA BINTI ISMAIL", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "NOR BAIZURAH BINTI MASLIM", oneMan: "FAIL", twoMan: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "SHIRLEY SEBELT", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "AMIR LUQMAN BIN MISKANI", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NAZURAH BINTI ABDUL LATIP", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NORSHELA BINTI YUSUF", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SITI KHAIRUNISA BINTI ZALEK", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MANSUR BIN MURNI", oneMan: "FAIL", twoMan: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "ELSIE ANAK BITI", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MARZUKI RAJANG", oneMan: "FAIL", twoMan: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "SUHARMIE BIN SULAIMAN", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "IMANUEL G. KORO", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "ALVIN DULAMIT", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MISRAWATI MA AMAN", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "FAIRYLICIA BRAIM", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SAUDAAH BINTI IDANG", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MYRA ATHIRA BINTI OMAR", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "KAMARIAH BINTI MOHAMAD ALI", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MOHAMMAD ANNAS BIN BOING", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "ABDUL RAHMAN BIN MOHAMAD BADARUDDIN", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "CHRISTINA PADIN", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "PRISCA ANAK RUE", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "JOHARI BIN EPIN", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SHAHIRUL AQMAL BIN SHAHEEDAN", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "AHMAD ZAKI ISAMUDDIN BIN MOHAMAD", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "JANIZA BINTI BUJANG", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "TRACY JONAS", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "ANGELINA RURAN SIGAR", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "CHRISTINE KOW CHONG LI", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "METHDIOUSE ANAK SILAN", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SA'DI BIN USOP", oneMan: "FAIL", twoMan: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "MUHD ZAINUL 'IZZAT BIN ZAINUDIN", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "RURAN SAUL", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "RAJAMI BIN ABDUL HASHIM", oneMan: "FAIL", twoMan: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "NADHIRAH BINTI MOHD HANAFIAH", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NURUL HAZWANIE ABDULLAH", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "GRACE NYURA ANAK JAMBAI", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NORFARAIN BINTI SARBINI@SALDAN", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "AMANDA BULAN SIGAR", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "CATHERINE JOHN", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "AWANGKU MOHAMMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "VOON KING FATT", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "WENDY CHANDI ANAK SAMPURAI", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MUHSINAH BINTI ABDUL SHOMAD", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "FARIDAH BINTI KUNAS", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "YONG ZILING", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SHAHRULNIZAM BIN IBRAHIM", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" }
];

async function compareChecklistResults() {
  console.log('🔍 Comparing provided results with database checklist_results...\n');

  try {
    // Get all checklist results from database
    console.log('1. Fetching checklist results from database...');
    const { data: dbResults, error: dbError } = await supabase
      .from('checklist_results')
      .select('user_id, participant_name, participant_ic, checklist_type, status')
      .not('user_id', 'is', null)
      .order('participant_name, checklist_type');

    if (dbError) {
      console.error('❌ Error fetching database results:', dbError);
      return;
    }

    console.log(`Database has ${dbResults.length} checklist results`);
    console.log('');

    // Group database results by participant
    const dbResultsByParticipant = {};
    dbResults.forEach(result => {
      const name = result.participant_name;
      if (!dbResultsByParticipant[name]) {
        dbResultsByParticipant[name] = {};
      }
      dbResultsByParticipant[name][result.checklist_type] = result.status;
    });

    console.log('2. Comparing results...\n');

    let matchCount = 0;
    let mismatchCount = 0;
    let missingFromDb = 0;
    let missingFromProvided = 0;

    const mismatches = [];
    const missingFromDbList = [];
    const missingFromProvidedList = [];

    // Check each provided result
    providedResults.forEach(provided => {
      const dbParticipant = dbResultsByParticipant[provided.name];
      
      if (!dbParticipant) {
        missingFromDb++;
        missingFromDbList.push(provided.name);
        console.log(`❌ ${provided.name}: NOT FOUND in database`);
        return;
      }

      // Check each checklist type
      const checklistTypes = [
        { key: 'oneMan', type: 'one-man-cpr' },
        { key: 'twoMan', type: 'two-man-cpr' },
        { key: 'adultChoking', type: 'adult-choking' },
        { key: 'infantChoking', type: 'infant-choking' },
        { key: 'infantCpr', type: 'infant-cpr' }
      ];

      let participantMatch = true;
      const participantMismatches = [];

      checklistTypes.forEach(({ key, type }) => {
        const providedStatus = provided[key];
        const dbStatus = dbParticipant[type];

        if (dbStatus && providedStatus !== dbStatus) {
          participantMatch = false;
          participantMismatches.push(`${type}: provided=${providedStatus}, db=${dbStatus}`);
        }
      });

      if (participantMatch) {
        matchCount++;
        console.log(`✅ ${provided.name}: MATCH`);
      } else {
        mismatchCount++;
        mismatches.push({
          name: provided.name,
          mismatches: participantMismatches
        });
        console.log(`❌ ${provided.name}: MISMATCH - ${participantMismatches.join(', ')}`);
      }
    });

    // Check for participants in database but not in provided results
    const providedNames = providedResults.map(p => p.name);
    Object.keys(dbResultsByParticipant).forEach(dbName => {
      if (!providedNames.includes(dbName)) {
        missingFromProvided++;
        missingFromProvidedList.push(dbName);
        console.log(`⚠️  ${dbName}: Found in database but NOT in provided results`);
      }
    });

    console.log('\n3. SUMMARY:');
    console.log(`Total provided results: ${providedResults.length}`);
    console.log(`Total database participants: ${Object.keys(dbResultsByParticipant).length}`);
    console.log(`Matches: ${matchCount}`);
    console.log(`Mismatches: ${mismatchCount}`);
    console.log(`Missing from database: ${missingFromDb}`);
    console.log(`Missing from provided: ${missingFromProvided}`);
    console.log('');

    if (mismatches.length > 0) {
      console.log('4. DETAILED MISMATCHES:');
      mismatches.forEach(mismatch => {
        console.log(`\n${mismatch.name}:`);
        mismatch.mismatches.forEach(m => console.log(`  - ${m}`));
      });
    }

    if (missingFromDbList.length > 0) {
      console.log('\n5. PARTICIPANTS MISSING FROM DATABASE:');
      missingFromDbList.forEach(name => console.log(`  - ${name}`));
    }

    if (missingFromProvidedList.length > 0) {
      console.log('\n6. PARTICIPANTS MISSING FROM PROVIDED RESULTS:');
      missingFromProvidedList.forEach(name => console.log(`  - ${name}`));
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
compareChecklistResults();

