// checkAndCleanProfiles.js
// Check the two specific profiles and remove others without IC

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// The two profiles to keep
const profilesToKeep = [
  "SA'DI BIN USOP",
  "AWANGKU MOHAMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK"
];

async function checkAndCleanProfiles() {
  console.log('🔍 Checking and Cleaning Profiles\n');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Get all profiles without IC
    console.log('📋 Fetching profiles without IC...');
    
    const { data: profilesWithoutIC, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, email, role, created_at')
      .or('ic.is.null,ic.eq.')
      .order('full_name');
    
    if (profilesError) {
      console.log(`❌ Error fetching profiles: ${profilesError.message}`);
      return;
    }
    
    console.log(`   📊 Found ${profilesWithoutIC.length} profiles without IC`);
    
    // Step 2: Check the two profiles to keep
    console.log('\n🔍 Checking profiles to keep...');
    
    const profilesToKeepData = [];
    const profilesToDelete = [];
    
    for (const profile of profilesWithoutIC) {
      const shouldKeep = profilesToKeep.some(keepName => 
        profile.full_name.toUpperCase() === keepName.toUpperCase()
      );
      
      if (shouldKeep) {
        console.log(`✅ KEEP: ${profile.full_name}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   IC: ${profile.ic || 'NULL'}`);
        console.log(`   Auth ID: ${profile.id}`);
        profilesToKeepData.push(profile);
      } else {
        console.log(`❌ DELETE: ${profile.full_name}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   IC: ${profile.ic || 'NULL'}`);
        console.log(`   Auth ID: ${profile.id}`);
        profilesToDelete.push(profile);
      }
    }
    
    // Step 3: Summary of what will be kept vs deleted
    console.log('\n📊 CLEANUP SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`   ✅ Profiles to keep: ${profilesToKeepData.length}`);
    console.log(`   ❌ Profiles to delete: ${profilesToDelete.length}`);
    console.log(`   📊 Total profiles without IC: ${profilesWithoutIC.length}`);
    
    if (profilesToKeepData.length > 0) {
      console.log('\n✅ PROFILES TO KEEP:');
      console.log('=' .repeat(60));
      profilesToKeepData.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   IC: ${profile.ic || 'NULL'}`);
        console.log(`   Auth ID: ${profile.id}`);
        console.log('');
      });
    }
    
    if (profilesToDelete.length > 0) {
      console.log('\n❌ PROFILES TO DELETE:');
      console.log('=' .repeat(60));
      profilesToDelete.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   IC: ${profile.ic || 'NULL'}`);
        console.log(`   Auth ID: ${profile.id}`);
        console.log('');
      });
    }
    
    // Step 4: Confirm deletion
    console.log('\n⚠️  CONFIRMATION REQUIRED:');
    console.log('=' .repeat(60));
    console.log(`This will DELETE ${profilesToDelete.length} profiles from the database.`);
    console.log('This action cannot be undone!');
    console.log('\nTo proceed with deletion, run:');
    console.log('node deleteUnwantedProfiles.js');
    
    // Step 5: Generate deletion script
    if (profilesToDelete.length > 0) {
      console.log('\n🔧 GENERATING DELETION SCRIPT...');
      console.log('=' .repeat(60));
      
      const deletionScript = `// deleteUnwantedProfiles.js
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
${profilesToDelete.map(p => `  "${p.id}"`).join(',\n')}
];

async function deleteUnwantedProfiles() {
  console.log('🗑️  Deleting Unwanted Profiles\\n');
  console.log('=' .repeat(60));
  
  try {
    let successCount = 0;
    let errorCount = 0;
    
    for (const profileId of profilesToDelete) {
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', profileId);
        
        if (error) {
          console.log(\`❌ Error deleting profile \${profileId}: \${error.message}\`);
          errorCount++;
        } else {
          console.log(\`✅ Deleted profile: \${profileId}\`);
          successCount++;
        }
      } catch (err) {
        console.log(\`❌ Unexpected error deleting \${profileId}: \${err.message}\`);
        errorCount++;
      }
    }
    
    console.log('\\n📊 DELETION SUMMARY:');
    console.log('=' .repeat(60));
    console.log(\`   ✅ Successfully deleted: \${successCount} profiles\`);
    console.log(\`   ❌ Errors: \${errorCount} profiles\`);
    console.log(\`   📊 Total processed: \${profilesToDelete.length} profiles\`);
    
  } catch (error) {
    console.error('❌ Deletion process failed:', error);
  }
}

// Run the deletion
deleteUnwantedProfiles();`;
      
      // Write the deletion script to file
      const fs = require('fs');
      fs.writeFileSync('deleteUnwantedProfiles.js', deletionScript);
      console.log('✅ Deletion script created: deleteUnwantedProfiles.js');
    }
    
  } catch (error) {
    console.error('❌ Process failed:', error);
  }
}

// Run the check
checkAndCleanProfiles();
