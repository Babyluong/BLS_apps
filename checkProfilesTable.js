// Check what columns exist in the profiles table
import supabase from './services/supabase.js';

async function checkProfilesTable() {
  console.log('🔍 Checking Profiles Table Structure...\n');
  
  try {
    // Get a sample profile to see what columns exist
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    
    if (profiles && profiles.length > 0) {
      console.log('📊 Available columns in profiles table:');
      console.log('=' * 40);
      
      const sampleProfile = profiles[0];
      Object.keys(sampleProfile).forEach(column => {
        const value = sampleProfile[column];
        const type = typeof value;
        console.log(`• ${column}: ${type} (${value})`);
      });
      
      // Check specifically for jawatan-related columns
      console.log('\n🔍 Jawatan-related columns:');
      const jawatanColumns = ['jawatan', 'job_position', 'gred', 'position', 'role', 'title'];
      jawatanColumns.forEach(col => {
        if (sampleProfile.hasOwnProperty(col)) {
          console.log(`✅ ${col}: ${sampleProfile[col]}`);
        } else {
          console.log(`❌ ${col}: Not found`);
        }
      });
      
    } else {
      console.log('⚠️  No profiles found in the table');
    }
    
  } catch (error) {
    console.error('❌ Error checking profiles table:', error);
  }
}

checkProfilesTable();
