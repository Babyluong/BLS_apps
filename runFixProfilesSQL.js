// runFixProfilesSQL.js
// Run the SQL script to fix profiles in the database

const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE'
);

async function runFixProfilesSQL() {
  try {
    console.log('🔧 Running SQL Script to Fix Profiles\n');
    console.log('=' .repeat(60));
    
    // 1. Update staff users
    console.log('1️⃣ Updating staff users...');
    
    const staffUpdates = [
      { email: 'rinnie.roy@example.com', ic: '860612525415', name: 'RINNIE ROY YABIL' },
      { email: 'ramadatul.azam@example.com', ic: '910404136303', name: 'RAMADATUL AZAM' },
      { email: 'faizatul.farahain@example.com', ic: '931113136664', name: 'FAIZATUL FARAHAIN BINTI JAKA' },
      { email: 'felicity.buaye@example.com', ic: '790817135874', name: 'Felicity Buaye' },
      { email: 'joannes.marvin@example.com', ic: '921201136323', name: 'JOANNES MARVIN ANAK SUBAH' },
      { email: 'mohd.faqrull@example.com', ic: '911007136347', name: 'MOHD FAQRULL IZAT BIN HANAPI' }
    ];
    
    let staffSuccess = 0;
    let staffError = 0;
    
    for (const user of staffUpdates) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            ic: user.ic,
            full_name: user.name,
            role: 'staff',
            jawatan: 'Staff',
            tempat_bertugas: 'BLS Training Center',
            updated_at: new Date().toISOString()
          })
          .eq('email', user.email);
        
        if (error) {
          console.error(`   ❌ Error updating ${user.name}:`, error.message);
          staffError++;
        } else {
          console.log(`   ✅ Updated ${user.name} (${user.ic}) - staff`);
          staffSuccess++;
        }
      } catch (error) {
        console.error(`   ❌ Exception updating ${user.name}:`, error.message);
        staffError++;
      }
    }
    
    // 2. Update admin users
    console.log('\n2️⃣ Updating admin users...');
    
    const adminUpdates = [
      { email: 'shamsury.majidi@example.com', ic: '770626135291', name: 'Shamsury bin Mohamad Majidi' },
      { email: 'jusnie.gambar@example.com', ic: '981013125488', name: 'JUSNIE GAMBAR' }
    ];
    
    let adminSuccess = 0;
    let adminError = 0;
    
    for (const user of adminUpdates) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            ic: user.ic,
            full_name: user.name,
            role: 'admin',
            jawatan: 'Administrator',
            tempat_bertugas: 'BLS Training Center',
            updated_at: new Date().toISOString()
          })
          .eq('email', user.email);
        
        if (error) {
          console.error(`   ❌ Error updating ${user.name}:`, error.message);
          adminError++;
        } else {
          console.log(`   ✅ Updated ${user.name} (${user.ic}) - admin`);
          adminSuccess++;
        }
      } catch (error) {
        console.error(`   ❌ Exception updating ${user.name}:`, error.message);
        adminError++;
      }
    }
    
    // 3. Verify the results
    console.log('\n3️⃣ Verifying results...');
    
    const { data: staffProfiles, error: staffVerifyError } = await supabase
      .from('profiles')
      .select('full_name, ic, email, role, jawatan')
      .eq('role', 'staff')
      .order('full_name');
    
    const { data: adminProfiles, error: adminVerifyError } = await supabase
      .from('profiles')
      .select('full_name, ic, email, role, jawatan')
      .eq('role', 'admin')
      .order('full_name');
    
    if (staffVerifyError || adminVerifyError) {
      console.error('❌ Error verifying results:', staffVerifyError || adminVerifyError);
    } else {
      console.log(`   Found ${staffProfiles.length} staff profiles`);
      console.log(`   Found ${adminProfiles.length} admin profiles`);
      
      if (staffProfiles.length > 0) {
        console.log('\n   👥 STAFF PROFILES:');
        staffProfiles.forEach((profile, index) => {
          console.log(`     ${index + 1}. ${profile.full_name} (${profile.ic}) - ${profile.email}`);
        });
      }
      
      if (adminProfiles.length > 0) {
        console.log('\n   👑 ADMIN PROFILES:');
        adminProfiles.forEach((profile, index) => {
          console.log(`     ${index + 1}. ${profile.full_name} (${profile.ic}) - ${profile.email}`);
        });
      }
    }
    
    // 4. Show final role distribution
    console.log('\n4️⃣ Final Role Distribution:');
    const { data: roleStats, error: roleError } = await supabase
      .from('profiles')
      .select('role')
      .not('role', 'is', null);
    
    if (!roleError && roleStats) {
      const roleDistribution = {};
      roleStats.forEach(user => {
        roleDistribution[user.role] = (roleDistribution[user.role] || 0) + 1;
      });
      
      console.log('   Current role distribution:');
      Object.entries(roleDistribution).forEach(([role, count]) => {
        console.log(`     ${role}: ${count} users`);
      });
    }
    
    // 5. Summary
    console.log('\n🎉 SQL SCRIPT COMPLETED!');
    console.log('=' .repeat(60));
    console.log('✅ Staff profiles updated:', staffSuccess);
    console.log('✅ Admin profiles updated:', adminSuccess);
    console.log('❌ Staff errors:', staffError);
    console.log('❌ Admin errors:', adminError);
    console.log('');
    console.log('🔑 Users can now login with:');
    console.log('   Email: [user email]');
    console.log('   Password: TempPass123!');
    console.log('   (Users should change password after first login)');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
runFixProfilesSQL();
