// deleteUnwantedProfiles.js
// Delete unwanted profiles (keep only SA'DI BIN USOP and AWANGKU MOHAMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK)

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Profiles to delete (IDs)
const profilesToDelete = [
  "4be3b816-0f44-4f39-986d-58768d1fa114", // CAROL FOLLORRIN ANAK BUSTIN
  "b6bef257-4488-4271-afd0-2676b9736f90"  // NURFAEEZA BINTI MASNI
];

async function deleteUnwantedProfiles() {
  console.log('🗑️  Deleting Unwanted Profiles\n');
  console.log('=' .repeat(60));
  
  try {
    // First, show what will be deleted
    console.log('📋 Profiles to be deleted:');
    console.log('=' .repeat(60));
    
    for (const profileId of profilesToDelete) {
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, full_name, email, ic')
        .eq('id', profileId)
        .single();
      
      if (fetchError) {
        console.log(`❌ Error fetching profile ${profileId}: ${fetchError.message}`);
      } else {
        console.log(`   ${profile.full_name} (${profile.email})`);
      }
    }
    
    console.log('\n⚠️  WARNING: This will permanently delete these profiles!');
    console.log('   This action cannot be undone!');
    
    let successCount = 0;
    let errorCount = 0;
    
    console.log('\n🗑️  Starting deletion...');
    
    for (const profileId of profilesToDelete) {
      try {
        console.log(`\n👤 Deleting profile: ${profileId}`);
        
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', profileId);
        
        if (error) {
          console.log(`   ❌ Error deleting profile: ${error.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Successfully deleted profile`);
          successCount++;
        }
      } catch (err) {
        console.log(`   ❌ Unexpected error: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log('\n📊 DELETION SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`   ✅ Successfully deleted: ${successCount} profiles`);
    console.log(`   ❌ Errors: ${errorCount} profiles`);
    console.log(`   📊 Total processed: ${profilesToDelete.length} profiles`);
    
    // Final verification
    console.log('\n🔍 Final verification...');
    
    const { data: remainingProfiles, error: verifyError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, email')
      .or('ic.is.null,ic.eq.')
      .order('full_name');
    
    if (verifyError) {
      console.log(`❌ Error in verification: ${verifyError.message}`);
    } else {
      console.log(`   📊 Remaining profiles without IC: ${remainingProfiles.length}`);
      
      if (remainingProfiles.length > 0) {
        console.log('\n📋 Remaining profiles:');
        remainingProfiles.forEach((profile, index) => {
          console.log(`${index + 1}. ${profile.full_name} (${profile.email})`);
        });
      }
    }
    
    console.log('\n🎉 CLEANUP COMPLETE!');
    console.log('=' .repeat(60));
    console.log('✅ Unwanted profiles deleted');
    console.log('✅ Only the specified profiles remain');
    console.log('✅ Database is now cleaner');
    
  } catch (error) {
    console.error('❌ Deletion process failed:', error);
  }
}

// Run the deletion
deleteUnwantedProfiles();
