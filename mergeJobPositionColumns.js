// mergeJobPositionColumns.js
// Merge job_position and jawatan columns in profiles table

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function mergeJobPositionColumns() {
  console.log('🔄 Merging job_position and jawatan Columns\n');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Get all profiles to analyze
    console.log('📋 Fetching all profiles...');
    
    const { data: profilesData, error: fetchError } = await supabase
      .from('profiles')
      .select('id, full_name, job_position, jawatan')
      .order('full_name');
    
    if (fetchError) {
      console.log(`❌ Error fetching profiles: ${fetchError.message}`);
      return;
    }
    
    console.log(`   📊 Found ${profilesData.length} profiles`);
    
    // Step 2: Analyze the data
    console.log('\n🔍 Analyzing data...');
    
    let jobPositionCount = 0;
    let jawatanCount = 0;
    let bothCount = 0;
    let neitherCount = 0;
    let differentValues = 0;
    
    profilesData.forEach(profile => {
      const hasJobPosition = profile.job_position && profile.job_position.trim() !== '';
      const hasJawatan = profile.jawatan && profile.jawatan.trim() !== '';
      
      if (hasJobPosition && hasJawatan) {
        bothCount++;
        if (profile.job_position !== profile.jawatan) {
          differentValues++;
        }
      } else if (hasJobPosition && !hasJawatan) {
        jobPositionCount++;
      } else if (!hasJobPosition && hasJawatan) {
        jawatanCount++;
      } else {
        neitherCount++;
      }
    });
    
    console.log('   📊 Analysis results:');
    console.log(`      Only job_position has value: ${jobPositionCount}`);
    console.log(`      Only jawatan has value: ${jawatanCount}`);
    console.log(`      Both have values: ${bothCount}`);
    console.log(`      Neither has value: ${neitherCount}`);
    console.log(`      Different values when both exist: ${differentValues}`);
    
    // Step 3: Update profiles to merge the columns
    console.log('\n🔄 Merging columns...');
    
    let successCount = 0;
    let errorCount = 0;
    const results = [];
    
    for (const profile of profilesData) {
      try {
        // Determine the best value to use
        let finalJobPosition = null;
        
        if (profile.jawatan && profile.jawatan.trim() !== '') {
          // Use jawatan if it has a value
          finalJobPosition = profile.jawatan.trim();
        } else if (profile.job_position && profile.job_position.trim() !== '') {
          // Use job_position if jawatan is empty
          finalJobPosition = profile.job_position.trim();
        }
        
        // Update the profile with the merged value
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            job_position: finalJobPosition,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);
        
        if (updateError) {
          console.log(`   ❌ Error updating ${profile.full_name}: ${updateError.message}`);
          results.push({
            name: profile.full_name,
            id: profile.id,
            status: 'ERROR',
            error: updateError.message
          });
          errorCount++;
        } else {
          console.log(`   ✅ Updated ${profile.full_name}: "${finalJobPosition || 'NULL'}"`);
          results.push({
            name: profile.full_name,
            id: profile.id,
            status: 'SUCCESS',
            finalValue: finalJobPosition
          });
          successCount++;
        }
        
      } catch (error) {
        console.log(`   ❌ Unexpected error for ${profile.full_name}: ${error.message}`);
        results.push({
          name: profile.full_name,
          id: profile.id,
          status: 'UNEXPECTED_ERROR',
          error: error.message
        });
        errorCount++;
      }
    }
    
    // Step 4: Summary
    console.log('\n📊 MERGE SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`   ✅ Successfully updated: ${successCount} profiles`);
    console.log(`   ❌ Errors: ${errorCount} profiles`);
    console.log(`   📊 Total processed: ${profilesData.length} profiles`);
    
    // Step 5: Show sample results
    console.log('\n📋 Sample Results:');
    console.log('=' .repeat(60));
    const successful = results.filter(r => r.status === 'SUCCESS').slice(0, 5);
    successful.forEach((result, index) => {
      console.log(`${index + 1}. ${result.name}`);
      console.log(`   Final job_position: "${result.finalValue || 'NULL'}"`);
      console.log('');
    });
    
    if (errorCount > 0) {
      console.log('\n❌ Errors:');
      console.log('=' .repeat(60));
      const errors = results.filter(r => r.status !== 'SUCCESS');
      errors.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}: ${result.error}`);
      });
    }
    
    console.log('\n🔄 NEXT STEPS:');
    console.log('=' .repeat(60));
    console.log('1. ✅ job_position column updated with merged data');
    console.log('2. 🔄 Consider dropping jawatan column (if no longer needed)');
    console.log('3. 🔄 Update application code to use job_position only');
    console.log('4. 🧪 Test all functionality');
    
  } catch (error) {
    console.error('❌ Merge process failed:', error);
  }
}

// Run the merge process
mergeJobPositionColumns();
