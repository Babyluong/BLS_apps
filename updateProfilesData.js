// updateProfilesData.js - Update profiles table with correct participant information
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

// Correct participant data from the provided list
const correctParticipantData = [
  { ic: '970324105472', name: 'Yong Ziling', email: 'yongziling@moh.gov.my', workplace: 'HOSPITAL LIMBANG', jawatan: 'PEGAWAI PERUBATAN', gred: 'UD 9' },
  { ic: '981231136564', name: 'CAROL FOLLORRIN ANAK BUSTIN', email: 'carolfollorrin@gmail.com', workplace: 'KLINIK PERGIGIAN LAWAS', jawatan: 'JURUTERAPI PERGIGIAN', gred: 'U 5' },
  { ic: '980724125949', name: 'JOHARI BIN EPIN', email: 'johaee24@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'PENOLONG PEGAWAI FARMASI', gred: 'U 5' },
  { ic: '961201136231', name: 'VOON KING FATT', email: 'kingfattvoon@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'PEGAWAI PERUBATAN', gred: 'UD 10' },
  { ic: '881028135349', name: 'MOHAMMAD ANNAS BIN BOING', email: 'mohammadannas@moh.gov.my', workplace: 'HOSPITAL LAWAS', jawatan: 'PEMBANTU PEGAWAI PERUBATAN', gred: 'U 6' },
  { ic: '911225125718', name: 'CHRISTINE KOW CHONG LI', email: 'christine.kcl@moh.gov.my', workplace: 'KLINIK PERGIGIAN LAWAS', jawatan: 'PEGAWAI PERGIGIAN', gred: 'UG 10' },
  { ic: '911030136310', name: 'NAZURAH BINTI ABDUL LATIP', email: 'juralatip3010@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'JURURAWAT', gred: 'U 5' },
  { ic: '810315135546', name: 'KAMARIAH BINTI MOHAMAD ALI', email: 'kamariah.m.ali@moh.gov.my', workplace: 'HOSPITAL LAWAS', jawatan: 'JURURAWAT', gred: 'U 6' },
  { ic: '910522125429', name: 'ALVIN DULAMIT', email: 'alvincie5115@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'JURUPULIH PERUBATAN CARAKERJA', gred: 'U 5' },
  { ic: '960222136244', name: 'Grace Nyura anak Jambai', email: 'gracenyura@gmail.com', workplace: 'KLINIK PERGIGIAN LAWAS', jawatan: 'PEGAWAI PERGIGIAN', gred: 'UG 9' },
  { ic: '951128126360', name: 'NORLINA BINTI ALI', email: 'norlinaali95@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'PEMBANTU PEGAWAI PERUBATAN', gred: 'U 5' },
  { ic: '721119135368', name: 'Razamah Binti Dullah', email: 'razamah.fn95@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'JURURAWAT', gred: 'U 6' },
  { ic: '790820135146', name: 'CATHERINE JOHN', email: 'c.thyreen2021@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'JURURAWAT', gred: 'U 6' },
  { ic: '841116136003', name: 'MOHAMAD FARIZZUL BIN JAYA', email: 'farizulbj@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'PEMBANTU PERAWATAN KESIHATAN', gred: 'U 1' },
  { ic: '940830126615', name: 'IMANUEL G. KORO', email: 'imanuel@moh.gov.my', workplace: 'HOSPITAL LAWAS', jawatan: 'PENOLONG PEGAWAI TADBIR', gred: 'N 5' },
  { ic: '810409135520', name: 'JANIZA BINTI BUJANG', email: 'neezabujang@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'JURURAWAT', gred: 'U 6' },
  { ic: '710217135106', name: 'Shirley sebelt', email: 'shirley.sebelt71@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'JURURAWAT', gred: 'U 7' },
  { ic: '970430136459', name: 'Shahirul Aqmal bin Shaheedan', email: 'shahirul.aqmal@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'PEGAWAI PERUBATAN', gred: 'UD 10' },
  { ic: '830926125994', name: 'FARIDAH BINTI KUNAS', email: 'farifari83_aku@yahoo.com.my', workplace: 'HOSPITAL LAWAS', jawatan: 'JURURAWAT', gred: 'U 5' },
  { ic: '860121525488', name: 'CHRISTINA PADIN', email: 'christinapadin22@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'JURURAWAT', gred: 'U 6' },
  { ic: '940402135566', name: 'PRISCA ANAK RUE', email: 'priscarue24@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'JURURAWAT', gred: 'U 5' },
  { ic: '980912135458', name: 'ELSIE ANAK BITI', email: 'elsiemorriebiti9898@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'JURURAWAT', gred: 'U 5' },
  { ic: '930829136657', name: 'Muhd Zainul Izzat Bin Zainudin', email: 'zainulizzat@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'JURURAWAT', gred: 'U 5' },
  { ic: '920509135402', name: 'SITI KHAIRUNISA BINTI ZALEK', email: 'nisazalek@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'JURURAWAT', gred: 'U 5' },
  { ic: '850722135232', name: 'norshela binti yusuf', email: 'shelayusuf175@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'PEMBANTU PERAWATAN KESIHATAN', gred: 'U 1' },
  { ic: '700825135119', name: 'RAJAMI BIN ABDUL HASHIM', email: 'rajami5119@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'PEMBANTU PERAWATAN KESIHATAN', gred: 'U 1' },
  { ic: '980627136064', name: 'NORFARAIN BINTI SARBINI@SALDAN', email: 'norfarainsarbini@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'PENOLONG PEGAWAI FARMASI', gred: 'U 5' },
  { ic: '980501115030', name: 'NADHIRAH BINTI MOHD HANAFIAH', email: 'nadhirahmh98@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'PEGAWAI FARMASI', gred: 'UF 9' },
  { ic: '960109035847', name: 'ABDUL RAHMAN BIN MOHAMAD BADARUDDIN', email: 'rahmanbadaruddin@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'PEGAWAI FARMASI', gred: 'UF 9' },
  { ic: '960911136696', name: 'NURFAEEZA BINTI MASNI', email: 'eiyzafaeiyza@yahoo.com.my', workplace: 'HOSPITAL LAWAS', jawatan: 'JURU-XRAY', gred: 'U 5' },
  { ic: '900612138742', name: 'RURAN SAUL', email: 'ruransaul1990@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'JURURAWAT', gred: 'U 5' },
  { ic: '740227135051', name: 'Methdiouse ak Silan', email: 'endansilan@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'PEMBANTU KHIDMAT AM', gred: 'H 1' },
  { ic: '850410135583', name: 'MANSUR BIN MURNI', email: 'mansurmurni22@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'PEMBANTU KHIDMAT AM', gred: 'H 1' },
  { ic: '960401135909', name: 'SHAHRULNIZAM BIN IBRAHIM', email: 'shahrulnizam3716@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'PEMBANTU PEGAWAI PERUBATAN', gred: 'U 5' },
  { ic: '840901136178', name: 'Amanda bulan sigar', email: 'amandasigar@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'PEMBANTU PERAWATAN KESIHATAN', gred: 'U 1' },
  { ic: '790313136208', name: 'ANGELINA RURAN SIGAR', email: 'angelina.ruran79@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'JURUTEKNOLOGI MAKMAL PERUBATAN', gred: 'U 6' },
  { ic: '830105135984', name: 'saudaah binti idang', email: 'saudahidang@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'PEMBANTU PERAWATAN KESIHATAN', gred: 'U 1' },
  { ic: '680924135151', name: 'SA"DI BIN USOP', email: 'sadiusop7581@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'PEMBANTU PERAWATAN KESIHATAN', gred: 'U 1' },
  { ic: '790825136156', name: 'NURUL HAZWANIE ABDULLAH', email: 'nurulhazwanie1505@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'JURURAWAT', gred: 'U 6' },
  { ic: '940819136687', name: 'Ahmmad Zaki Isamuddin Bin Mohamad', email: 'zaki940852@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'PEMANDU', gred: 'U 1' },
  { ic: '941223136648', name: 'NOR BAIZURAH BINTI MASLIM', email: 'norbaizurah1994@gmail.com', workplace: 'KK LAWAS', jawatan: 'PEMBANTU PERAWATAN KESIHATAN', gred: 'U 1' },
  { ic: '981108136016', name: 'Fizra ivy was', email: 'fizraivy@gmail.com', workplace: 'KK LAWAS', jawatan: 'PEMBANTU PERAWATAN KESIHATAN', gred: 'U 1' },
  { ic: '950728135098', name: 'NURIZANIE BINTI SANEH', email: 'ezanie950728@gmail.com', workplace: 'KK LAWAS', jawatan: 'PEMBANTU PERAWATAN KESIHATAN', gred: 'U 1' },
  { ic: '901225136514', name: 'Nurmasliana Binti Ismail', email: 'maslianaismail8@gmail.com', workplace: 'KK LAWAS', jawatan: 'PEMBANTU PERAWATAN KESIHATAN', gred: 'U 1' },
  { ic: '960927136308', name: 'Fairylicia Braim', email: 'fairybobbylicia@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'JURURAWAT', gred: 'U 5' },
  { ic: '900512126138', name: 'MISRAWATI BINTI MA AMAN', email: 'miesra.maaman125@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'JURURAWAT', gred: 'U 5' },
  { ic: '820924135946', name: 'EMILY AKUP', email: 'emilyakup8279@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'JURURAWAT', gred: 'U 5' },
  { ic: '880708135196', name: 'Grace Ruran Ngilo', email: 'gracee8788@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'PEMBANTU PERAWATAN KESIHATAN', gred: 'U 1' },
  { ic: '920303125954', name: 'TRACY JONAS', email: 'immaculateflynn@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'JURURAWAT MASYARAKAT', gred: 'U 1' },
  { ic: '920529126298', name: 'MYRA ATHIRA BINTI OMAR', email: 'myraathira53@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'JURURAWAT MASYARAKAT', gred: 'U 1' },
  { ic: '890916135624', name: 'Nur amanda belinda jarut', email: 'nuramandabelindajarut@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'JURURAWAT MASYARAKAT', gred: 'U 1' },
  { ic: '950623146647', name: 'Amir Luqman', email: 'roketship101@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'PEGAWAI PERUBATAN', gred: 'UD 10' },
  { ic: '740709135492', name: 'NURITA BINTI HANTIN', email: 'nbhromeoalfa07@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'JURURAWAT', gred: 'U 6' },
  { ic: '921022136061', name: 'Syamsul Hardy Bin Ramlan', email: 'syamgunners22@gmail.com', workplace: 'HOSPITAL LAWAS', jawatan: 'JURUPULIH PERUBATAN CARAKERJA', gred: 'U 5' }
];

async function updateProfilesData() {
  console.log('🔄 Updating profiles table with correct participant data...\n');

  try {
    // First, let's check the current profiles structure
    console.log('1. Checking current profiles structure...');
    const { data: currentProfiles, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (fetchError) {
      console.error('❌ Error fetching profiles:', fetchError);
      return;
    }

    console.log('Current profiles structure:', currentProfiles[0]);
    console.log('');

    // Check if tempat_bertugas column exists
    console.log('2. Checking if tempat_bertugas column exists...');
    const { data: columnCheck, error: columnError } = await supabase
      .from('profiles')
      .select('tempat_bertugas')
      .limit(1);

    if (columnError && columnError.message.includes('tempat_bertugas')) {
      console.log('❌ tempat_bertugas column does not exist. Need to add it first.');
      console.log('Please run this SQL in Supabase Dashboard:');
      console.log('ALTER TABLE profiles ADD COLUMN tempat_bertugas TEXT;');
      console.log('ALTER TABLE profiles ADD COLUMN gred TEXT;');
      return;
    }

    console.log('✅ tempat_bertugas column exists');
    console.log('');

    // Update profiles with correct data
    console.log('3. Updating profiles with correct data...');
    let updatedCount = 0;
    let errorCount = 0;

    for (const participant of correctParticipantData) {
      try {
        // Find profile by IC
        const { data: existingProfile, error: findError } = await supabase
          .from('profiles')
          .select('id, ic, full_name, email, jawatan, tempat_bertugas, gred')
          .eq('ic', participant.ic)
          .single();

        if (findError) {
          console.log(`⚠️  Profile not found for IC ${participant.ic} (${participant.name})`);
          continue;
        }

        // Update the profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: participant.name,
            email: participant.email,
            jawatan: participant.jawatan,
            tempat_bertugas: participant.workplace,
            gred: participant.gred,
            job_position: participant.jawatan // Merge job_position with jawatan
          })
          .eq('id', existingProfile.id);

        if (updateError) {
          console.error(`❌ Error updating ${participant.name}:`, updateError.message);
          errorCount++;
        } else {
          console.log(`✅ Updated: ${participant.name} (${participant.ic})`);
          updatedCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${participant.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Update Summary:');
    console.log(`✅ Successfully updated: ${updatedCount} profiles`);
    console.log(`❌ Errors: ${errorCount} profiles`);
    console.log(`📝 Total processed: ${correctParticipantData.length} profiles`);

    // Verify the updates
    console.log('\n4. Verifying updates...');
    const { data: updatedProfiles, error: verifyError } = await supabase
      .from('profiles')
      .select('ic, full_name, email, jawatan, tempat_bertugas, gred')
      .not('tempat_bertugas', 'is', null)
      .limit(10);

    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError);
    } else {
      console.log('✅ Sample updated profiles:');
      updatedProfiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name} (${profile.ic})`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Workplace: ${profile.tempat_bertugas}`);
        console.log(`   Position: ${profile.jawatan} (${profile.gred})`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the update
updateProfilesData();

