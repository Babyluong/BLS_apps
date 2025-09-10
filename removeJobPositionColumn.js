// removeJobPositionColumn.js - Remove job_position column since it's now identical to jawatan
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeJobPositionColumn() {
  console.log('🗑️  Removing job_position column since it\'s identical to jawatan...\n');

  try {
    // First, verify that job_position and jawatan are identical
    console.log('1. Verifying that job_position and jawatan are identical...');
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('ic, full_name, jawatan, job_position')
      .eq('role', 'user')
      .limit(10);

    if (fetchError) {
      console.error('❌ Error fetching profiles:', fetchError);
      return;
    }

    console.log('Sample profiles to verify:');
    let allIdentical = true;
    profiles.forEach((profile, index) => {
      const isIdentical = profile.jawatan === profile.job_position;
      if (!isIdentical) {
        allIdentical = false;
        console.log(`❌ ${profile.full_name}: jawatan="${profile.jawatan}" vs job_position="${profile.job_position}"`);
      } else {
        console.log(`✅ ${profile.full_name}: "${profile.jawatan}"`);
      }
    });

    if (!allIdentical) {
      console.log('\n⚠️  Warning: job_position and jawatan are not identical for all profiles!');
      console.log('Please check the data before proceeding with column removal.');
      return;
    }

    console.log('\n✅ All profiles have identical job_position and jawatan values');
    console.log('');

    // Since we can't directly drop columns via Supabase client, we'll provide the SQL command
    console.log('2. SQL command to remove job_position column:');
    console.log('');
    console.log('Please run this SQL command in your Supabase Dashboard:');
    console.log('');
    console.log('ALTER TABLE profiles DROP COLUMN job_position;');
    console.log('');
    console.log('This will:');
    console.log('- Remove the job_position column completely');
    console.log('- Keep only the jawatan column with the combined data');
    console.log('- Reduce database storage and simplify the schema');
    console.log('');

    // Verify current column structure
    console.log('3. Current column structure (before removal):');
    const { data: sampleProfile, error: sampleError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'user')
      .limit(1);

    if (sampleError) {
      console.error('❌ Error fetching sample profile:', sampleError);
    } else if (sampleProfile.length > 0) {
      const columns = Object.keys(sampleProfile[0]);
      console.log('Current columns in profiles table:');
      columns.forEach((column, index) => {
        const hasJobPosition = column === 'job_position';
        const hasJawatan = column === 'jawatan';
        console.log(`${index + 1}. ${column}${hasJobPosition ? ' (TO BE REMOVED)' : ''}${hasJawatan ? ' (KEEP)' : ''}`);
      });
    }

    // Show final recommendation
    console.log('\n4. Final recommendation:');
    console.log('✅ After running the SQL command, your profiles table will have:');
    console.log('   - jawatan: Contains the combined position and grade (e.g., "JURURAWAT U 5")');
    console.log('   - gred: NULL (since it\'s now part of jawatan)');
    console.log('   - job_position: REMOVED (no longer needed)');
    console.log('');
    console.log('This will make your database cleaner and more efficient! 🚀');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
removeJobPositionColumn();

