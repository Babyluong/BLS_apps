// addStaffAndAdminFixed.js
// Add staff and admin users to Supabase profiles table (fixed version)

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E'
);

async function addStaffAndAdminFixed() {
  try {
    console.log('👥 Adding Staff and Admin Users to Supabase (Fixed Version)\n');
    console.log('=' .repeat(60));
    
    // 1. Define staff and admin users
    console.log('1. 📋 Preparing staff and admin data...');
    
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
    
    // 2. Check for existing users
    console.log('\n2. 🔍 Checking for existing users...');
    
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
    
    // 3. Add users as regular users first
    console.log('\n3. ➕ Adding users as regular users first...');
    
    const allUsers = [...staffUsers, ...adminUsers];
    const newUsers = allUsers.filter(user => !existingICs.has(user.ic));
    
    let addedCount = 0;
    let errorCount = 0;
    
    if (newUsers.length > 0) {
      console.log(`   Adding ${newUsers.length} new users...`);
      for (const user of newUsers) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            full_name: user.full_name,
            ic: user.ic,
            email: user.email,
            role: 'user', // Add as regular user first
            tempat_bertugas: 'BLS Training Center',
            jawatan: user.role === 'admin' ? 'Administrator' : 'Staff',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error(`   ❌ Error adding ${user.full_name}:`, insertError);
          errorCount++;
        } else {
          console.log(`   ✅ Added ${user.full_name} as regular user`);
          addedCount++;
        }
      }
    }
    
    // 4. Provide SQL to update roles
    console.log('\n4. 🔧 Role Update Required:');
    console.log('-' .repeat(40));
    console.log('Due to RLS policies, you need to run this SQL in Supabase SQL editor:');
    console.log('');
    console.log('-- Update staff users to staff role');
    staffUsers.forEach(user => {
      console.log(`UPDATE profiles SET role = 'staff', jawatan = 'Staff' WHERE ic = '${user.ic}';`);
    });
    console.log('');
    console.log('-- Update admin users to admin role');
    adminUsers.forEach(user => {
      console.log(`UPDATE profiles SET role = 'admin', jawatan = 'Administrator' WHERE ic = '${user.ic}';`);
    });
    console.log('');
    
    // 5. Alternative: Create a function to update roles
    console.log('5. 🛠️ Alternative: Create update function...');
    console.log('-' .repeat(40));
    console.log('Or create this function in Supabase SQL editor:');
    console.log('');
    console.log('CREATE OR REPLACE FUNCTION update_user_roles()');
    console.log('RETURNS VOID AS $$');
    console.log('BEGIN');
    console.log('  -- Update staff users');
    staffUsers.forEach(user => {
      console.log(`  UPDATE profiles SET role = 'staff', jawatan = 'Staff' WHERE ic = '${user.ic}';`);
    });
    console.log('  -- Update admin users');
    adminUsers.forEach(user => {
      console.log(`  UPDATE profiles SET role = 'admin', jawatan = 'Administrator' WHERE ic = '${user.ic}';`);
    });
    console.log('END;');
    console.log('$$ LANGUAGE plpgsql;');
    console.log('');
    console.log('-- Then run: SELECT update_user_roles();');
    
    // 6. Show current status
    console.log('\n6. 📊 Current Status:');
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
    
    // 7. Show the users that were added
    console.log('\n7. 👥 Users Added:');
    console.log('-' .repeat(40));
    
    const { data: addedUsers, error: addedError } = await supabase
      .from('profiles')
      .select('full_name, ic, role, jawatan')
      .in('ic', allICs)
      .order('role, full_name');
    
    if (!addedError && addedUsers) {
      console.log('   Users in database:');
      addedUsers.forEach((user, index) => {
        console.log(`     ${index + 1}. ${user.full_name} (${user.ic}) - ${user.role} - ${user.jawatan}`);
      });
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('=' .repeat(60));
    console.log('1. ✅ Users have been added as regular users');
    console.log('2. 🔧 Run the SQL commands above to update their roles');
    console.log('3. ✅ Staff and admin users will be ready for use');
    console.log('4. 🔐 Implement role-based access control in your app');
    
    console.log('\n📋 Summary:');
    console.log(`   Total users added: ${addedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Staff users to promote: ${staffUsers.length}`);
    console.log(`   Admin users to promote: ${adminUsers.length}`);
    
  } catch (error) {
    console.error('❌ Adding users failed:', error);
  }
}

// Run the script
addStaffAndAdminFixed();
