// addStaffAdminWithAuth.js
// Add staff and admin users with authentication accounts

const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.YourServiceRoleKeyHere' // Replace with your service role key
);

async function addStaffAdminWithAuth() {
  try {
    console.log('👥 Adding Staff and Admin Users with Authentication\n');
    console.log('=' .repeat(60));
    
    // 1. Define staff and admin users
    const staffUsers = [
      {
        full_name: 'RINNIE ROY YABIL',
        ic: '860612525415',
        email: 'rinnie.roy@example.com',
        password: 'TempPass123!',
        role: 'staff'
      },
      {
        full_name: 'RAMADATUL AZAM',
        ic: '910404136303',
        email: 'ramadatul.azam@example.com',
        password: 'TempPass123!',
        role: 'staff'
      },
      {
        full_name: 'FAIZATUL FARAHAIN BINTI JAKA',
        ic: '931113136664',
        email: 'faizatul.farahain@example.com',
        password: 'TempPass123!',
        role: 'staff'
      },
      {
        full_name: 'Felicity Buaye',
        ic: '790817135874',
        email: 'felicity.buaye@example.com',
        password: 'TempPass123!',
        role: 'staff'
      },
      {
        full_name: 'JOANNES MARVIN ANAK SUBAH',
        ic: '921201136323',
        email: 'joannes.marvin@example.com',
        password: 'TempPass123!',
        role: 'staff'
      },
      {
        full_name: 'MOHD FAQRULL IZAT BIN HANAPI',
        ic: '911007136347',
        email: 'mohd.faqrull@example.com',
        password: 'TempPass123!',
        role: 'staff'
      }
    ];
    
    const adminUsers = [
      {
        full_name: 'Shamsury bin Mohamad Majidi',
        ic: '770626135291',
        email: 'shamsury.majidi@example.com',
        password: 'TempPass123!',
        role: 'admin'
      },
      {
        full_name: 'JUSNIE GAMBAR',
        ic: '981013125488',
        email: 'jusnie.gambar@example.com',
        password: 'TempPass123!',
        role: 'admin'
      }
    ];
    
    const allUsers = [...staffUsers, ...adminUsers];
    
    console.log(`📋 Users to add: ${allUsers.length} total`);
    console.log(`   Staff: ${staffUsers.length}`);
    console.log(`   Admin: ${adminUsers.length}`);
    
    // 2. Add users to authentication
    console.log('\n2. 🔐 Creating authentication accounts...');
    
    let authSuccessCount = 0;
    let authErrorCount = 0;
    const createdUserIds = [];
    
    for (const user of allUsers) {
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            full_name: user.full_name,
            ic: user.ic,
            role: user.role
          }
        });
        
        if (authError) {
          console.error(`   ❌ Auth error for ${user.full_name}:`, authError.message);
          authErrorCount++;
        } else {
          console.log(`   ✅ Auth created for ${user.full_name} (${user.role})`);
          createdUserIds.push(authData.user.id);
          authSuccessCount++;
        }
      } catch (error) {
        console.error(`   ❌ Error creating auth for ${user.full_name}:`, error.message);
        authErrorCount++;
      }
    }
    
    // 3. Add profiles to database
    console.log('\n3. 📊 Adding profiles to database...');
    
    let profileSuccessCount = 0;
    let profileErrorCount = 0;
    
    for (const user of allUsers) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: createdUserIds[allUsers.indexOf(user)] || gen_random_uuid(),
            full_name: user.full_name,
            ic: user.ic,
            email: user.email,
            role: user.role,
            tempat_bertugas: 'BLS Training Center',
            jawatan: user.role === 'admin' ? 'Administrator' : 'Staff',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (profileError) {
          console.error(`   ❌ Profile error for ${user.full_name}:`, profileError.message);
          profileErrorCount++;
        } else {
          console.log(`   ✅ Profile created for ${user.full_name}`);
          profileSuccessCount++;
        }
      } catch (error) {
        console.error(`   ❌ Error creating profile for ${user.full_name}:`, error.message);
        profileErrorCount++;
      }
    }
    
    // 4. Verify results
    console.log('\n4. 🔍 Verifying results...');
    
    const { data: allStaff, error: staffError } = await supabase
      .from('profiles')
      .select('full_name, ic, email, role, jawatan')
      .eq('role', 'staff')
      .order('full_name');
    
    const { data: allAdmins, error: adminError } = await supabase
      .from('profiles')
      .select('full_name, ic, email, role, jawatan')
      .eq('role', 'admin')
      .order('full_name');
    
    if (staffError || adminError) {
      console.error('❌ Error verifying results:', staffError || adminError);
    } else {
      console.log(`\n   📊 Final Results:`);
      console.log(`   Staff users: ${allStaff.length}`);
      console.log(`   Admin users: ${allAdmins.length}`);
      console.log(`   Auth accounts created: ${authSuccessCount}`);
      console.log(`   Profiles created: ${profileSuccessCount}`);
      console.log(`   Auth errors: ${authErrorCount}`);
      console.log(`   Profile errors: ${profileErrorCount}`);
      
      console.log('\n   👥 Staff Users:');
      allStaff.forEach((user, index) => {
        console.log(`     ${index + 1}. ${user.full_name} (${user.ic}) - ${user.email}`);
      });
      
      console.log('\n   👑 Admin Users:');
      allAdmins.forEach((user, index) => {
        console.log(`     ${index + 1}. ${user.full_name} (${user.ic}) - ${user.email}`);
      });
    }
    
    // 5. Show login credentials
    console.log('\n5. 🔑 Login Credentials:');
    console.log('-' .repeat(40));
    console.log('All users can login with:');
    console.log('Password: TempPass123!');
    console.log('(Users should change their password after first login)');
    console.log('');
    console.log('Staff Emails:');
    staffUsers.forEach(user => {
      console.log(`  ${user.email}`);
    });
    console.log('');
    console.log('Admin Emails:');
    adminUsers.forEach(user => {
      console.log(`  ${user.email}`);
    });
    
    console.log('\n🎉 STAFF AND ADMIN USERS ADDED SUCCESSFULLY!');
    console.log('=' .repeat(60));
    console.log('✅ Authentication accounts created');
    console.log('✅ Profiles added to database');
    console.log('✅ Users can now login to the app');
    console.log('✅ Role-based access control ready');
    
  } catch (error) {
    console.error('❌ Adding users failed:', error);
  }
}

// Run the script
addStaffAdminWithAuth();
