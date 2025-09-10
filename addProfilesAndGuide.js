// addProfilesAndGuide.js
// Add profiles to database and guide through manual auth creation

const { createClient } = require('@supabase/supabase-js');

// Use anon key for database operations
const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E'
);

async function addProfilesAndGuide() {
  try {
    console.log('👥 Adding Staff and Admin Profiles to Database\n');
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
    
    console.log(`📋 Adding ${allUsers.length} profiles to database...`);
    console.log(`   Staff: ${staffUsers.length}`);
    console.log(`   Admin: ${adminUsers.length}`);
    
    // 2. Add profiles to database
    let successCount = 0;
    let errorCount = 0;
    
    for (const user of allUsers) {
      try {
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: crypto.randomUUID(),
            full_name: user.name,
            ic: user.ic,
            email: user.email,
            role: user.role,
            tempat_bertugas: 'BLS Training Center',
            jawatan: user.role === 'admin' ? 'Administrator' : 'Staff',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          console.error(`   ❌ Error adding ${user.name}:`, error.message);
          errorCount++;
        } else {
          console.log(`   ✅ Added ${user.name} (${user.role})`);
          successCount++;
        }
      } catch (error) {
        console.error(`   ❌ Exception adding ${user.name}:`, error.message);
        errorCount++;
      }
    }
    
    // 3. Show results
    console.log('\n📊 Database Results:');
    console.log(`   ✅ Successfully added: ${successCount} profiles`);
    console.log(`   ❌ Errors: ${errorCount} profiles`);
    
    // 4. Verify profiles
    console.log('\n🔍 Verifying profiles...');
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
    
    // 5. Show manual auth creation guide
    console.log('\n🔐 MANUAL AUTHENTICATION CREATION REQUIRED:');
    console.log('=' .repeat(60));
    console.log('Since service role key is having issues, create auth accounts manually:');
    console.log('');
    console.log('1. 📱 Go to Supabase Dashboard → Authentication → Users');
    console.log('2. 👤 Click "Add User" for each user below:');
    console.log('3. 📧 Use the email and set password: TempPass123!');
    console.log('4. ✅ Check "Email Confirmed" for each user');
    console.log('');
    
    console.log('👥 STAFF USERS TO CREATE:');
    staffUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.ic})`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Password: TempPass123!`);
      console.log('');
    });
    
    console.log('👑 ADMIN USERS TO CREATE:');
    adminUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.ic})`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Password: TempPass123!`);
      console.log('');
    });
    
    console.log('🎯 AFTER CREATING AUTH ACCOUNTS:');
    console.log('✅ Users will be able to login to your BLS app');
    console.log('✅ Role-based access control will work');
    console.log('✅ Staff and admin features will be available');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
addProfilesAndGuide();
