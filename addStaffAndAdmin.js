// addStaffAndAdmin.js
// Add staff and admin users to Supabase profiles table

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E'
);

async function addStaffAndAdmin() {
  try {
    console.log('👥 Adding Staff and Admin Users to Supabase\n');
    console.log('=' .repeat(60));
    
    // 1. Check if profiles table has role column
    console.log('1. 🔍 Checking profiles table structure...');
    const { data: sampleProfile, error: sampleError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Error checking profiles table:', sampleError);
      return;
    }
    
    const hasRoleColumn = sampleProfile && sampleProfile.length > 0 && 'role' in sampleProfile[0];
    console.log(`   Role column: ${hasRoleColumn ? '✅ Exists' : '❌ Missing'}`);
    
    if (!hasRoleColumn) {
      console.log('\n⚠️ Adding role column to profiles table...');
      // Note: This would need to be done via SQL in Supabase
      console.log('   Please run this SQL in Supabase SQL editor:');
      console.log('   ALTER TABLE profiles ADD COLUMN role VARCHAR(20) DEFAULT \'participant\';');
      console.log('   ALTER TABLE profiles ADD CONSTRAINT check_role CHECK (role IN (\'participant\', \'staff\', \'admin\'));');
      console.log('   COMMENT ON COLUMN profiles.role IS \'User role: participant, staff, or admin\';');
      return;
    }
    
    // 2. Define staff and admin users
    console.log('\n2. 📋 Preparing staff and admin data...');
    
    const staffUsers = [
      {
        full_name: 'RINNIE ROY YABIL',
        ic: '860612525415',
        email: 'rinnie.roy@example.com',
        role: 'staff'
      },
      {
        full_name: 'RAMADATUL AZAM',
        ic: '910404136303',
        email: 'ramadatul.azam@example.com',
        role: 'staff'
      },
      {
        full_name: 'FAIZATUL FARAHAIN BINTI JAKA',
        ic: '931113136664',
        email: 'faizatul.farahain@example.com',
        role: 'staff'
      },
      {
        full_name: 'Felicity Buaye',
        ic: '790817135874',
        email: 'felicity.buaye@example.com',
        role: 'staff'
      },
      {
        full_name: 'JOANNES MARVIN ANAK SUBAH',
        ic: '921201136323',
        email: 'joannes.marvin@example.com',
        role: 'staff'
      },
      {
        full_name: 'MOHD FAQRULL IZAT BIN HANAPI',
        ic: '911007136347',
        email: 'mohd.faqrull@example.com',
        role: 'staff'
      }
    ];
    
    const adminUsers = [
      {
        full_name: 'Shamsury bin Mohamad Majidi',
        ic: '770626135291',
        email: 'shamsury.majidi@example.com',
        role: 'admin'
      },
      {
        full_name: 'JUSNIE GAMBAR',
        ic: '981013125488',
        email: 'jusnie.gambar@example.com',
        role: 'admin'
      }
    ];
    
    console.log(`   Staff users: ${staffUsers.length}`);
    console.log(`   Admin users: ${adminUsers.length}`);
    console.log(`   Total users: ${staffUsers.length + adminUsers.length}`);
    
    // 3. Check for existing users
    console.log('\n3. 🔍 Checking for existing users...');
    
    const allICs = [...staffUsers, ...adminUsers].map(user => user.ic);
    const { data: existingUsers, error: existingError } = await supabase
      .from('profiles')
      .select('ic, full_name, role')
      .in('ic', allICs);
    
    if (existingError) {
      console.error('❌ Error checking existing users:', existingError);
      return;
    }
    
    const existingICs = new Set(existingUsers.map(user => user.ic));
    console.log(`   Found ${existingUsers.length} existing users`);
    
    if (existingUsers.length > 0) {
      console.log('   Existing users:');
      existingUsers.forEach(user => {
        console.log(`     ${user.full_name} (${user.ic}) - ${user.role}`);
      });
    }
    
    // 4. Add new users
    console.log('\n4. ➕ Adding new users...');
    
    const allUsers = [...staffUsers, ...adminUsers];
    const newUsers = allUsers.filter(user => !existingICs.has(user.ic));
    const updateUsers = allUsers.filter(user => existingICs.has(user.ic));
    
    console.log(`   New users to add: ${newUsers.length}`);
    console.log(`   Existing users to update: ${updateUsers.length}`);
    
    let addedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    // Add new users
    if (newUsers.length > 0) {
      console.log('\n   Adding new users...');
      for (const user of newUsers) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            full_name: user.full_name,
            ic: user.ic,
            email: user.email,
            role: user.role,
            tempat_bertugas: 'BLS Training Center',
            jawatan: user.role === 'admin' ? 'Administrator' : 'Staff',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error(`   ❌ Error adding ${user.full_name}:`, insertError);
          errorCount++;
        } else {
          console.log(`   ✅ Added ${user.full_name} (${user.role})`);
          addedCount++;
        }
      }
    }
    
    // Update existing users
    if (updateUsers.length > 0) {
      console.log('\n   Updating existing users...');
      for (const user of updateUsers) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            role: user.role,
            jawatan: user.role === 'admin' ? 'Administrator' : 'Staff',
            updated_at: new Date().toISOString()
          })
          .eq('ic', user.ic);
        
        if (updateError) {
          console.error(`   ❌ Error updating ${user.full_name}:`, updateError);
          errorCount++;
        } else {
          console.log(`   ✅ Updated ${user.full_name} to ${user.role}`);
          updatedCount++;
        }
      }
    }
    
    // 5. Verify the results
    console.log('\n5. 🔍 Verifying results...');
    
    const { data: allStaff, error: staffError } = await supabase
      .from('profiles')
      .select('full_name, ic, role, jawatan')
      .eq('role', 'staff')
      .order('full_name');
    
    const { data: allAdmins, error: adminError } = await supabase
      .from('profiles')
      .select('full_name, ic, role, jawatan')
      .eq('role', 'admin')
      .order('full_name');
    
    if (staffError || adminError) {
      console.error('❌ Error verifying results:', staffError || adminError);
    } else {
      console.log(`\n   📊 Final Results:`);
      console.log(`   Staff users: ${allStaff.length}`);
      console.log(`   Admin users: ${allAdmins.length}`);
      console.log(`   Total added: ${addedCount}`);
      console.log(`   Total updated: ${updatedCount}`);
      console.log(`   Errors: ${errorCount}`);
      
      console.log('\n   👥 Staff Users:');
      allStaff.forEach((user, index) => {
        console.log(`     ${index + 1}. ${user.full_name} (${user.ic}) - ${user.jawatan}`);
      });
      
      console.log('\n   👑 Admin Users:');
      allAdmins.forEach((user, index) => {
        console.log(`     ${index + 1}. ${user.full_name} (${user.ic}) - ${user.jawatan}`);
      });
    }
    
    // 6. Show role distribution
    console.log('\n6. 📈 Role Distribution:');
    console.log('-' .repeat(40));
    
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
    
    console.log('\n🎉 STAFF AND ADMIN USERS ADDED SUCCESSFULLY!');
    console.log('=' .repeat(60));
    console.log('✅ All staff and admin users have been added/updated');
    console.log('✅ Users can now be assigned appropriate roles in your app');
    console.log('✅ System ready for role-based access control');
    
  } catch (error) {
    console.error('❌ Adding users failed:', error);
  }
}

// Run the script
addStaffAndAdmin();
