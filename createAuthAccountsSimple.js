// createAuthAccountsSimple.js
// Simple approach to create auth accounts using anon key

const { createClient } = require('@supabase/supabase-js');

// Use anon key instead of service role key
const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E'
);

async function createAuthAccountsSimple() {
  try {
    console.log('🔐 Creating Authentication Accounts (Simple Method)\n');
    console.log('=' .repeat(60));
    
    // 1. Define users
    const users = [
      // Staff users
      { name: 'RINNIE ROY YABIL', ic: '860612525415', email: 'rinnie.roy@example.com', role: 'staff' },
      { name: 'RAMADATUL AZAM', ic: '910404136303', email: 'ramadatul.azam@example.com', role: 'staff' },
      { name: 'FAIZATUL FARAHAIN BINTI JAKA', ic: '931113136664', email: 'faizatul.farahain@example.com', role: 'staff' },
      { name: 'Felicity Buaye', ic: '790817135874', email: 'felicity.buaye@example.com', role: 'staff' },
      { name: 'JOANNES MARVIN ANAK SUBAH', ic: '921201136323', email: 'joannes.marvin@example.com', role: 'staff' },
      { name: 'MOHD FAQRULL IZAT BIN HANAPI', ic: '911007136347', email: 'mohd.faqrull@example.com', role: 'staff' },
      
      // Admin users
      { name: 'Shamsury bin Mohamad Majidi', ic: '770626135291', email: 'shamsury.majidi@example.com', role: 'admin' },
      { name: 'JUSNIE GAMBAR', ic: '981013125488', email: 'jusnie.gambar@example.com', role: 'admin' }
    ];
    
    console.log(`📋 Users to create: ${users.length}`);
    console.log(`   Staff: ${users.filter(u => u.role === 'staff').length}`);
    console.log(`   Admin: ${users.filter(u => u.role === 'admin').length}`);
    
    // 2. Since we can't create auth users with anon key, let's show instructions
    console.log('\n⚠️  Cannot create auth users programmatically with anon key');
    console.log('📋 Manual Steps Required:');
    console.log('-' .repeat(40));
    
    console.log('\n1. 🔐 Go to Supabase Dashboard → Authentication → Users');
    console.log('2. 👤 Click "Add User" for each user below:');
    console.log('3. 📧 Use the email and set password: TempPass123!');
    console.log('4. ✅ Check "Email Confirmed" for each user');
    
    console.log('\n👥 STAFF USERS:');
    users.filter(u => u.role === 'staff').forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.ic})`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Password: TempPass123!`);
      console.log('');
    });
    
    console.log('👑 ADMIN USERS:');
    users.filter(u => u.role === 'admin').forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.ic})`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Password: TempPass123!`);
      console.log('');
    });
    
    // 3. Check if profiles already exist
    console.log('\n🔍 Checking existing profiles...');
    const { data: existingProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, ic, email, role')
      .in('ic', users.map(u => u.ic));
    
    if (profileError) {
      console.error('❌ Error checking profiles:', profileError);
    } else {
      console.log(`   Found ${existingProfiles.length} existing profiles`);
      if (existingProfiles.length > 0) {
        console.log('   Existing profiles:');
        existingProfiles.forEach(profile => {
          console.log(`     ${profile.full_name} (${profile.ic}) - ${profile.role}`);
        });
      }
    }
    
    // 4. Show next steps
    console.log('\n📋 NEXT STEPS:');
    console.log('=' .repeat(60));
    console.log('1. ✅ Run the SQL script to add profiles (if not done)');
    console.log('2. 🔐 Create auth accounts manually in Supabase Dashboard');
    console.log('3. ✅ Users will be able to login to your BLS app');
    console.log('4. 🔐 Users should change password after first login');
    
    console.log('\n🎯 After creating auth accounts, users can login with:');
    console.log('   Email: [their email]');
    console.log('   Password: TempPass123!');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
createAuthAccountsSimple();
