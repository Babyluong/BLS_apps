// createMissingProfiles.js - Create missing profiles for participants not found in profiles table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

// Missing participants that need to be created
const missingParticipants = [
  { 
    ic: '981231136564', 
    name: 'CAROL FOLLORRIN ANAK BUSTIN', 
    email: 'carolfollorrin@gmail.com', 
    workplace: 'KLINIK PERGIGIAN LAWAS', 
    jawatan: 'JURUTERAPI PERGIGIAN', 
    gred: 'U 5' 
  },
  { 
    ic: '960911136696', 
    name: 'NURFAEEZA BINTI MASNI', 
    email: 'eiyzafaeiyza@yahoo.com.my', 
    workplace: 'HOSPITAL LAWAS', 
    jawatan: 'JURU-XRAY', 
    gred: 'U 5' 
  }
];

async function createMissingProfiles() {
  console.log('🔄 Creating missing profiles for participants...\n');

  try {
    for (const participant of missingParticipants) {
      console.log(`Creating profile for: ${participant.name} (${participant.ic})`);
      
      // Generate a random UUID for the profile
      const profileId = crypto.randomUUID();
      
      // Create the profile
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: profileId,
          ic: participant.ic,
          full_name: participant.name,
          email: participant.email,
          jawatan: participant.jawatan,
          job_position: participant.jawatan, // Merge job_position with jawatan
          tempat_bertugas: participant.workplace,
          gred: participant.gred,
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error(`❌ Error creating profile for ${participant.name}:`, error.message);
      } else {
        console.log(`✅ Successfully created profile for ${participant.name}`);
      }
    }

    // Verify the created profiles
    console.log('\n🔍 Verifying created profiles...');
    const { data: createdProfiles, error: verifyError } = await supabase
      .from('profiles')
      .select('ic, full_name, email, jawatan, tempat_bertugas, gred')
      .in('ic', missingParticipants.map(p => p.ic));

    if (verifyError) {
      console.error('❌ Error verifying created profiles:', verifyError);
    } else {
      console.log('✅ Created profiles:');
      createdProfiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name} (${profile.ic})`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Workplace: ${profile.tempat_bertugas}`);
        console.log(`   Position: ${profile.jawatan} (${profile.gred})`);
        console.log('');
      });
    }

    // Check total profiles count
    console.log('📊 Checking total profiles count...');
    const { count: totalProfiles, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting profiles:', countError);
    } else {
      console.log(`✅ Total profiles in database: ${totalProfiles}`);
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
createMissingProfiles();

