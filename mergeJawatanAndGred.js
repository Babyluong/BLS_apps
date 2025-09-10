// mergeJawatanAndGred.js - Merge job_position and jawatan, combine gred with jawatan
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function mergeJawatanAndGred() {
  console.log('🔄 Merging job_position and jawatan, combining gred with jawatan...\n');

  try {
    // Get all user profiles
    console.log('1. Fetching all user profiles...');
    const { data: allProfiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, ic, full_name, jawatan, job_position, gred')
      .eq('role', 'user')
      .order('full_name');

    if (fetchError) {
      console.error('❌ Error fetching profiles:', fetchError);
      return;
    }

    console.log(`Found ${allProfiles.length} user profiles`);
    console.log('');

    // Process each profile
    console.log('2. Processing profiles...');
    let updatedCount = 0;
    let errorCount = 0;

    for (const profile of allProfiles) {
      try {
        // Create the combined jawatan with gred
        let combinedJawatan = profile.jawatan || '';
        const gred = profile.gred || '';
        
        // If gred exists and is not already in jawatan, add it
        if (gred && !combinedJawatan.toLowerCase().includes(gred.toLowerCase())) {
          combinedJawatan = `${combinedJawatan} ${gred}`.trim();
        }

        // Clean up the combined jawatan (remove extra spaces, standardize format)
        combinedJawatan = combinedJawatan
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .replace(/\bGRED\s+/gi, '') // Remove "GRED" prefix if it exists
          .trim();

        console.log(`Updating ${profile.full_name} (${profile.ic}):`);
        console.log(`  Old jawatan: ${profile.jawatan}`);
        console.log(`  Old gred: ${profile.gred}`);
        console.log(`  New jawatan: ${combinedJawatan}`);
        console.log('');

        // Update the profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            jawatan: combinedJawatan,
            job_position: combinedJawatan, // Keep job_position in sync
            gred: null, // Remove gred since it's now combined with jawatan
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);

        if (updateError) {
          console.error(`❌ Error updating ${profile.full_name}:`, updateError.message);
          errorCount++;
        } else {
          console.log(`✅ Updated ${profile.full_name}`);
          updatedCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${profile.full_name}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Update Summary:`);
    console.log(`✅ Successfully updated: ${updatedCount} profiles`);
    console.log(`❌ Errors: ${errorCount} profiles`);
    console.log(`📝 Total processed: ${allProfiles.length} profiles`);

    // Verify the updates
    console.log('\n3. Verifying updates...');
    const { data: updatedProfiles, error: verifyError } = await supabase
      .from('profiles')
      .select('ic, full_name, jawatan, job_position, gred')
      .eq('role', 'user')
      .limit(10);

    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError);
    } else {
      console.log('✅ Sample updated profiles:');
      updatedProfiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name} (${profile.ic})`);
        console.log(`   Jawatan: ${profile.jawatan}`);
        console.log(`   Job Position: ${profile.job_position}`);
        console.log(`   Gred: ${profile.gred || 'NULL (merged)'}`);
        console.log('');
      });
    }

    // Check if all profiles now have null gred
    console.log('4. Checking gred field status...');
    const { data: profilesWithGred, error: gredError } = await supabase
      .from('profiles')
      .select('ic, full_name, gred')
      .eq('role', 'user')
      .not('gred', 'is', null);

    if (gredError) {
      console.error('❌ Error checking gred field:', gredError);
    } else if (profilesWithGred.length > 0) {
      console.log(`⚠️  ${profilesWithGred.length} profiles still have gred values:`);
      profilesWithGred.forEach(profile => {
        console.log(`- ${profile.full_name} (${profile.ic}): ${profile.gred}`);
      });
    } else {
      console.log('✅ All profiles now have null gred (successfully merged)');
    }

    // Show final sample of combined jawatan
    console.log('\n5. Final sample of combined jawatan:');
    const { data: finalSample, error: finalError } = await supabase
      .from('profiles')
      .select('ic, full_name, jawatan')
      .eq('role', 'user')
      .limit(5);

    if (finalError) {
      console.error('❌ Error fetching final sample:', finalError);
    } else {
      finalSample.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name} (${profile.ic})`);
        console.log(`   Jawatan: ${profile.jawatan}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
mergeJawatanAndGred();

