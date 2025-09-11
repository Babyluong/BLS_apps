// migrateJawatanCategories.js
// Migration script to update existing profiles with new jawatan categorization

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Clinical jawatan list (only 7 positions)
const CLINICAL_JAWATAN = [
  "PEGAWAI PERUBATAN",
  "PENOLONG PEGAWAI PERUBATAN",
  "JURURAWAT",
  "JURURAWAT MASYARAKAT",
  "PEMBANTU PERAWATAN KESIHATAN",
  "PEGAWAI PERGIGIAN",
  "JURUTERAPI PERGIGIAN"
];

function getUserCategorySync(jawatan) {
  if (!jawatan) return 'non-clinical';
  
  const jawatanUpper = String(jawatan).toUpperCase().trim();
  const isClinical = CLINICAL_JAWATAN.some(clinicalJawatan => 
    jawatanUpper.includes(clinicalJawatan)
  );
  
  return isClinical ? 'clinical' : 'non-clinical';
}

async function migrateJawatanCategories() {
  console.log('🚀 Starting Jawatan Categories Migration...\n');
  
  try {
    // Step 1: Get all profiles with jawatan
    console.log('📋 Fetching profiles with jawatan...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, jawatan, category')
      .not('jawatan', 'is', null);
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }
    
    console.log(`✅ Found ${profiles.length} profiles with jawatan\n`);
    
    // Step 2: Categorize each profile
    console.log('🔍 Categorizing profiles...');
    const categorizedProfiles = profiles.map(profile => ({
      ...profile,
      newCategory: getUserCategorySync(profile.jawatan)
    }));
    
    // Step 3: Show categorization summary
    const clinicalCount = categorizedProfiles.filter(p => p.newCategory === 'clinical').length;
    const nonClinicalCount = categorizedProfiles.filter(p => p.newCategory === 'non-clinical').length;
    
    console.log('📊 Categorization Summary:');
    console.log(`   Clinical: ${clinicalCount}`);
    console.log(`   Non-Clinical: ${nonClinicalCount}\n`);
    
    // Step 4: Show clinical profiles
    console.log('🏥 CLINICAL PROFILES:');
    console.log('====================');
    const clinicalProfiles = categorizedProfiles.filter(p => p.newCategory === 'clinical');
    clinicalProfiles.forEach((profile, index) => {
      const status = profile.category === 'clinical' ? '✅' : '🔄';
      console.log(`${index + 1}. ${status} ${profile.full_name} - ${profile.jawatan}`);
    });
    
    console.log('\n🏢 NON-CLINICAL PROFILES:');
    console.log('=========================');
    const nonClinicalProfiles = categorizedProfiles.filter(p => p.newCategory === 'non-clinical');
    nonClinicalProfiles.forEach((profile, index) => {
      const status = profile.category === 'non-clinical' ? '✅' : '🔄';
      console.log(`${index + 1}. ${status} ${profile.full_name} - ${profile.jawatan}`);
    });
    
    // Step 5: Update profiles that need category changes
    console.log('\n🔄 Updating profiles with category changes...');
    let updated = 0;
    let errors = 0;
    
    for (const profile of categorizedProfiles) {
      if (profile.category !== profile.newCategory) {
        try {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              category: profile.newCategory,
              updated_at: new Date().toISOString()
            })
            .eq('id', profile.id);
          
          if (updateError) {
            console.error(`❌ Error updating ${profile.full_name}:`, updateError);
            errors++;
          } else {
            console.log(`✅ Updated ${profile.full_name}: ${profile.category} → ${profile.newCategory}`);
            updated++;
          }
        } catch (error) {
          console.error(`❌ Error updating ${profile.full_name}:`, error);
          errors++;
        }
      }
    }
    
    // Step 6: Summary
    console.log('\n📈 MIGRATION SUMMARY:');
    console.log('====================');
    console.log(`Total profiles processed: ${profiles.length}`);
    console.log(`Profiles updated: ${updated}`);
    console.log(`Errors: ${errors}`);
    console.log(`Profiles already correct: ${profiles.length - updated - errors}`);
    
    if (errors === 0) {
      console.log('\n✅ Migration completed successfully!');
    } else {
      console.log(`\n⚠️  Migration completed with ${errors} errors.`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
migrateJawatanCategories();
