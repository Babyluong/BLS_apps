// checkProfileColumns.js
// Check the current structure of profiles table

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkProfileColumns() {
  console.log('🔍 Checking Profiles Table Columns\n');
  console.log('=' .repeat(60));
  
  try {
    // Get sample data to see the columns
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.log(`❌ Error accessing profiles table: ${profilesError.message}`);
      return;
    }
    
    console.log('📋 Current Profiles Table Structure:');
    console.log('=' .repeat(60));
    
    if (profilesData.length > 0) {
      const sampleProfile = profilesData[0];
      const columns = Object.keys(sampleProfile);
      
      columns.forEach((column, index) => {
        const value = sampleProfile[column];
        const hasValue = value !== null && value !== undefined && value !== '';
        console.log(`${index + 1}. ${column}: ${hasValue ? `"${value}"` : 'NULL/EMPTY'}`);
      });
      
      // Check specifically for job_position and jawatan
      console.log('\n🔍 Checking job_position vs jawatan:');
      console.log('=' .repeat(60));
      
      const hasJobPosition = 'job_position' in sampleProfile;
      const hasJawatan = 'jawatan' in sampleProfile;
      
      console.log(`   job_position column exists: ${hasJobPosition}`);
      console.log(`   jawatan column exists: ${hasJawatan}`);
      
      if (hasJobPosition && hasJawatan) {
        console.log('\n📊 Sample data comparison:');
        profilesData.forEach((profile, index) => {
          console.log(`\n${index + 1}. ${profile.full_name}:`);
          console.log(`   job_position: "${profile.job_position || 'NULL'}"`);
          console.log(`   jawatan: "${profile.jawatan || 'NULL'}"`);
          
          if (profile.job_position && profile.jawatan) {
            if (profile.job_position === profile.jawatan) {
              console.log('   ✅ Values are identical');
            } else {
              console.log('   ⚠️  Values are different');
            }
          } else if (profile.job_position && !profile.jawatan) {
            console.log('   ℹ️  Only job_position has value');
          } else if (!profile.job_position && profile.jawatan) {
            console.log('   ℹ️  Only jawatan has value');
          } else {
            console.log('   ℹ️  Both are empty');
          }
        });
      }
    } else {
      console.log('❌ No profiles found');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Run the check
checkProfileColumns();
