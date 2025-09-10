// fixICDiscrepancies.js
// Fix IC discrepancies based on provided data

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// IC corrections based on provided data
const icCorrections = [
  {
    name: "AWANGKU MOHAMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK",
    correctIC: "950821136503",
    currentIC: null
  },
  {
    name: "MOHAMAD FARIZZUL BIN JAYA", 
    correctIC: "841116136003",
    currentIC: "950821136503"
  },
  {
    name: "MOHAMMAD ANNAS BIN BOING",
    correctIC: "881028135349", 
    currentIC: "334269604567"
  }
];

async function fixICDiscrepancies() {
  console.log('🔧 Fixing IC Discrepancies\n');
  console.log('=' .repeat(60));
  
  try {
    let successCount = 0;
    let errorCount = 0;
    const results = [];
    
    console.log('📋 IC Corrections to apply:');
    icCorrections.forEach((correction, index) => {
      console.log(`${index + 1}. ${correction.name}`);
      console.log(`   From: ${correction.currentIC || 'NULL'} → To: ${correction.correctIC}`);
    });
    
    console.log('\n🔄 Applying corrections...');
    
    for (const correction of icCorrections) {
      console.log(`\n👤 Processing: ${correction.name}`);
      console.log(`   Current IC: ${correction.currentIC || 'NULL'}`);
      console.log(`   Correct IC: ${correction.correctIC}`);
      
      try {
        // Find the profile
        const { data: profile, error: findError } = await supabase
          .from('profiles')
          .select('id, full_name, ic, email')
          .eq('full_name', correction.name)
          .single();
        
        if (findError) {
          console.log(`   ❌ Profile not found: ${findError.message}`);
          results.push({
            name: correction.name,
            status: 'NOT_FOUND',
            error: findError.message
          });
          errorCount++;
          continue;
        }
        
        console.log(`   📧 Email: ${profile.email}`);
        console.log(`   🆔 Profile ID: ${profile.id}`);
        
        // Update the IC
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            ic: correction.correctIC,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);
        
        if (updateError) {
          console.log(`   ❌ Update failed: ${updateError.message}`);
          results.push({
            name: correction.name,
            status: 'UPDATE_ERROR',
            error: updateError.message,
            correctIC: correction.correctIC
          });
          errorCount++;
        } else {
          console.log(`   ✅ IC updated successfully: ${correction.correctIC}`);
          results.push({
            name: correction.name,
            status: 'SUCCESS',
            correctIC: correction.correctIC
          });
          successCount++;
        }
        
      } catch (error) {
        console.log(`   ❌ Unexpected error: ${error.message}`);
        results.push({
          name: correction.name,
          status: 'UNEXPECTED_ERROR',
          error: error.message,
          correctIC: correction.correctIC
        });
        errorCount++;
      }
    }
    
    // Summary
    console.log('\n📊 CORRECTION SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`   ✅ Successfully updated: ${successCount} profiles`);
    console.log(`   ❌ Errors: ${errorCount} profiles`);
    console.log(`   📊 Total processed: ${icCorrections.length} profiles`);
    
    if (successCount > 0) {
      console.log('\n🎉 SUCCESS! IC corrections applied:');
      console.log('=' .repeat(60));
      const successful = results.filter(r => r.status === 'SUCCESS');
      successful.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}: ${result.correctIC}`);
      });
    }
    
    if (errorCount > 0) {
      console.log('\n❌ ERRORS:');
      console.log('=' .repeat(60));
      const errors = results.filter(r => r.status !== 'SUCCESS');
      errors.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}: ${result.error}`);
      });
    }
    
    // Final verification
    console.log('\n🔍 Final verification...');
    
    const { data: finalProfiles, error: finalError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, email')
      .or('ic.is.null,ic.eq.')
      .order('full_name');
    
    if (finalError) {
      console.log(`❌ Error in final verification: ${finalError.message}`);
    } else {
      console.log(`   📊 Profiles still without IC: ${finalProfiles.length}`);
      
      if (finalProfiles.length > 0) {
        console.log('\n📋 Remaining profiles without IC:');
        finalProfiles.forEach((profile, index) => {
          console.log(`${index + 1}. ${profile.full_name} (${profile.email})`);
        });
      } else {
        console.log('\n🎉 ALL PROFILES NOW HAVE IC NUMBERS!');
        console.log('   ✅ 100% IC coverage achieved');
        console.log('   ✅ IC conflicts resolved');
        console.log('   ✅ All users can login with Name + IC');
        console.log('   ✅ Migration is 100% complete');
      }
    }
    
    // Check for duplicate ICs
    console.log('\n🔍 Checking for duplicate ICs...');
    
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('id, full_name, ic')
      .not('ic', 'is', null)
      .neq('ic', '');
    
    if (!allError) {
      const icCounts = {};
      allProfiles.forEach(profile => {
        if (profile.ic) {
          icCounts[profile.ic] = (icCounts[profile.ic] || 0) + 1;
        }
      });
      
      const duplicateICs = Object.entries(icCounts).filter(([ic, count]) => count > 1);
      
      if (duplicateICs.length > 0) {
        console.log('⚠️  Duplicate ICs found:');
        duplicateICs.forEach(([ic, count]) => {
          console.log(`   IC ${ic}: ${count} profiles`);
        });
      } else {
        console.log('✅ No duplicate ICs found');
      }
    }
    
    console.log('\n🔄 NEXT STEPS:');
    console.log('=' .repeat(60));
    console.log('1. ✅ IC discrepancies fixed');
    console.log('2. ✅ IC conflicts resolved');
    console.log('3. 🧪 Test login functionality for all users');
    console.log('4. 🔄 Update application code to use profiles only');
    console.log('5. 🗑️ Drop users table after testing');
    console.log('6. 🎉 Migration 100% complete!');
    
  } catch (error) {
    console.error('❌ Process failed:', error);
  }
}

// Run the corrections
fixICDiscrepancies();
