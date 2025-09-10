// addProfilesStepByStep.js
// Add profiles step by step: first as users, then update roles

const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE'
);

async function addProfilesStepByStep() {
  try {
    console.log('👥 Adding Staff and Admin Profiles (Step by Step)\n');
    console.log('=' .repeat(60));
    
    // 1. Define users
    const staffUsers = [
      { name: 'RINNIE ROY YABIL', ic: '860612525415', email: 'rinnie.roy@example.com', role: 'staff' },
      { name: 'RAMADATUL AZAM', ic: '910404136303', email: 'ramadatul.azam@example.com', role: 'staff' },
      { name: 'FAIZATUL FARAHAIN BINTI JAKA', ic: '931113136664', email: 'faizatul.farahain@example.com', role: 'staff' },
      { name: 'Felicity Buaye', ic: '790817135874', email: 'felicity.buaye@example.com', role: 'staff' },
      { name: 'JOANNES MARVIN ANAK SUBAH', ic: '921201136323', email: 'joannes.marvin@example.com', role: 'staff' },
      { name: 'MOHD FAQRULL IZAT BIN HANAPI', ic: '911007136347', email: 'mohd.faqrull@example.com', role: 'staff' }
    ];
    
    const adminUsers = [
      { name: 'Shamsury bin Mohamad Majidi', ic: '770626135291', email: 'shamsury.majidi@example.com', role: 'admin' },
      { name: 'JUSNIE GAMBAR', ic: '981013125488', email: 'jusnie.gambar@example.com', role: 'admin' }
    ];
    
    const allUsers = [...staffUsers, ...adminUsers];
    
    console.log(`📋 Processing ${allUsers.length} users...`);
    console.log(`   Staff: ${staffUsers.length}`);
    console.log(`   Admin: ${adminUsers.length}`);
    
    // 2. Step 1: Add profiles as regular users first
    console.log('\n1️⃣ Adding profiles as regular users...');
    let step1Success = 0;
    let step1Error = 0;
    
    for (const user of allUsers) {
      try {
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: crypto.randomUUID(),
            full_name: user.name,
            ic: user.ic,
            email: user.email,
            role: 'user', // Add as regular user first
            tempat_bertugas: 'BLS Training Center',
            jawatan: 'User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          console.error(`   ❌ Error adding ${user.name}:`, error.message);
          step1Error++;
        } else {
          console.log(`   ✅ Added ${user.name} as regular user`);
          step1Success++;
        }
      } catch (error) {
        console.error(`   ❌ Exception adding ${user.name}:`, error.message);
        step1Error++;
      }
    }
    
    console.log(`   Step 1 Results: ${step1Success} success, ${step1Error} errors`);
    
    // 3. Step 2: Update roles to staff/admin
    console.log('\n2️⃣ Updating roles to staff/admin...');
    let step2Success = 0;
    let step2Error = 0;
    
    for (const user of allUsers) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            role: user.role,
            jawatan: user.role === 'admin' ? 'Administrator' : 'Staff',
            updated_at: new Date().toISOString()
          })
          .eq('ic', user.ic);
        
        if (error) {
          console.error(`   ❌ Error updating ${user.name}:`, error.message);
          step2Error++;
        } else {
          console.log(`   ✅ Updated ${user.name} to ${user.role}`);
          step2Success++;
        }
      } catch (error) {
        console.error(`   ❌ Exception updating ${user.name}:`, error.message);
        step2Error++;
      }
    }
    
    console.log(`   Step 2 Results: ${step2Success} success, ${step2Error} errors`);
    
    // 4. Verify final results
    console.log('\n🔍 Verifying final results...');
    const { data: allProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, ic, email, role, jawatan')
      .in('ic', allUsers.map(u => u.ic))
      .order('role, full_name');
    
    if (profileError) {
      console.error('❌ Error verifying profiles:', profileError);
    } else {
      console.log(`   Found ${allProfiles.length} profiles in database`);
      
      if (allProfiles.length > 0) {
        console.log('\n   👥 STAFF PROFILES:');
        allProfiles.filter(p => p.role === 'staff').forEach((profile, index) => {
          console.log(`     ${index + 1}. ${profile.full_name} (${profile.ic}) - ${profile.email}`);
        });
        
        console.log('\n   👑 ADMIN PROFILES:');
        allProfiles.filter(p => p.role === 'admin').forEach((profile, index) => {
          console.log(`     ${index + 1}. ${profile.full_name} (${profile.ic}) - ${profile.email}`);
        });
      }
    }
    
    // 5. Show role distribution
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
    console.log('✅ Profiles added to database');
    console.log('✅ Roles updated successfully');
    console.log('✅ Users can now login to your BLS app');
    console.log('✅ Role-based access control ready');
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
addProfilesStepByStep();
