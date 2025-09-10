// createAuthAccounts.js
// Create authentication accounts for staff and admin users

const { createClient } = require('@supabase/supabase-js');

// You need to replace this with your service role key
// Get it from: Supabase Dashboard > Settings > API > service_role key
const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE'
);

async function createAuthAccounts() {
  try {
    console.log('🔐 Creating Authentication Accounts for Staff and Admin Users\n');
    console.log('=' .repeat(60));
    
    // 1. Define users with their details
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
    
    console.log(`📋 Creating auth accounts for ${users.length} users...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // 2. Create authentication accounts
    for (const user of users) {
      try {
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: 'TempPass123!', // Temporary password
          email_confirm: true,
          user_metadata: {
            full_name: user.name,
            ic: user.ic,
            role: user.role
          }
        });
        
        if (error) {
          console.error(`❌ Error creating ${user.name}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Created auth account for ${user.name} (${user.role})`);
          successCount++;
        }
      } catch (error) {
        console.error(`❌ Exception for ${user.name}:`, error.message);
        errorCount++;
      }
    }
    
    // 3. Show results
    console.log('\n📊 Results:');
    console.log(`✅ Successfully created: ${successCount} accounts`);
    console.log(`❌ Errors: ${errorCount} accounts`);
    
    // 4. Show login credentials
    console.log('\n🔑 Login Credentials:');
    console.log('-' .repeat(40));
    console.log('All users can login with:');
    console.log('Password: TempPass123!');
    console.log('(Users should change their password after first login)');
    console.log('');
    console.log('Staff Emails:');
    users.filter(u => u.role === 'staff').forEach(user => {
      console.log(`  ${user.email}`);
    });
    console.log('');
    console.log('Admin Emails:');
    users.filter(u => u.role === 'admin').forEach(user => {
      console.log(`  ${user.email}`);
    });
    
    console.log('\n🎉 Authentication accounts created successfully!');
    console.log('Users can now login to your BLS app.');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    console.log('\n💡 Make sure to:');
    console.log('1. Replace YOUR_SERVICE_ROLE_KEY_HERE with your actual service role key');
    console.log('2. Get your service role key from: Supabase Dashboard > Settings > API');
  }
}

// Run the script
createAuthAccounts();