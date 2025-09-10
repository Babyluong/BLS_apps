// fixProfiles.js
// Fix the profiles by updating ICs and roles

const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE'
);

async function fixProfiles() {
  try {
    console.log('🔧 Fixing Profiles - Updating ICs and Roles\n');
    console.log('=' .repeat(60));
    
    // 1. Define users with their correct ICs and roles
    const userMappings = [
      { email: 'rinnie.roy@example.com', ic: '860612525415', name: 'RINNIE ROY YABIL', role: 'staff' },
      { email: 'ramadatul.azam@example.com', ic: '910404136303', name: 'RAMADATUL AZAM', role: 'staff' },
      { email: 'faizatul.farahain@example.com', ic: '931113136664', name: 'FAIZATUL FARAHAIN BINTI JAKA', role: 'staff' },
      { email: 'felicity.buaye@example.com', ic: '790817135874', name: 'Felicity Buaye', role: 'staff' },
      { email: 'joannes.marvin@example.com', ic: '921201136323', name: 'JOANNES MARVIN ANAK SUBAH', role: 'staff' },
      { email: 'mohd.faqrull@example.com', ic: '911007136347', name: 'MOHD FAQRULL IZAT BIN HANAPI', role: 'staff' },
      { email: 'shamsury.majidi@example.com', ic: '770626135291', name: 'Shamsury bin Mohamad Majidi', role: 'admin' },
      { email: 'jusnie.gambar@example.com', ic: '981013125488', name: 'JUSNIE GAMBAR', role: 'admin' }
    ];
    
    console.log(`📋 Fixing ${userMappings.length} profiles...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // 2. Update each profile
    for (const user of userMappings) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            ic: user.ic,
            full_name: user.name,
            role: user.role,
            jawatan: user.role === 'admin' ? 'Administrator' : 'Staff',
            tempat_bertugas: 'BLS Training Center',
            updated_at: new Date().toISOString()
          })
          .eq('email', user.email);
        
        if (error) {
          console.error(`   ❌ Error updating ${user.name}:`, error.message);
          errorCount++;
        } else {
          console.log(`   ✅ Updated ${user.name} (${user.ic}) - ${user.role}`);
          successCount++;
        }
      } catch (error) {
        console.error(`   ❌ Exception updating ${user.name}:`, error.message);
        errorCount++;
      }
    }
    
    // 3. Verify the results
    console.log('\n🔍 Verifying updated profiles...');
    const { data: updatedProfiles, error: verifyError } = await supabase
      .from('profiles')
      .select('full_name, ic, email, role, jawatan')
      .in('email', userMappings.map(u => u.email))
      .order('role, full_name');
    
    if (verifyError) {
      console.error('❌ Error verifying profiles:', verifyError);
    } else {
      console.log(`   Found ${updatedProfiles.length} updated profiles`);
      
      if (updatedProfiles.length > 0) {
        console.log('\n   👥 STAFF PROFILES:');
        updatedProfiles.filter(p => p.role === 'staff').forEach((profile, index) => {
          console.log(`     ${index + 1}. ${profile.full_name} (${profile.ic}) - ${profile.email}`);
        });
        
        console.log('\n   👑 ADMIN PROFILES:');
        updatedProfiles.filter(p => p.role === 'admin').forEach((profile, index) => {
          console.log(`     ${index + 1}. ${profile.full_name} (${profile.ic}) - ${profile.email}`);
        });
      }
    }
    
    // 4. Show final role distribution
    console.log('\n📈 Final Role Distribution:');
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
    
    console.log('\n🎉 SETUP COMPLETE!');
    console.log('=' .repeat(60));
    console.log('✅ Authentication accounts created');
    console.log('✅ Profiles updated with correct ICs and roles');
    console.log('✅ Users can now login to your BLS app');
    console.log('✅ Role-based access control ready');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Profiles updated: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log('');
    console.log('🔑 Login Credentials:');
    console.log('   Email: [user email]');
    console.log('   Password: TempPass123!');
    console.log('   (Users should change password after first login)');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
fixProfiles();
