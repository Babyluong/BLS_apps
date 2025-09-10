// debugProfiles.js
// Debug what's actually in the profiles table

const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE'
);

async function debugProfiles() {
  try {
    console.log('🔍 Debugging Profiles in Database\n');
    console.log('=' .repeat(60));
    
    // 1. Get all profiles
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (allError) {
      console.error('❌ Error fetching profiles:', allError);
      return;
    }
    
    console.log(`📊 Total profiles in database: ${allProfiles.length}`);
    console.log('\n📋 Recent profiles:');
    allProfiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.full_name} (${profile.ic}) - ${profile.role} - ${profile.email}`);
    });
    
    // 2. Check for staff and admin roles specifically
    console.log('\n🔍 Checking for staff and admin roles...');
    const { data: staffAdminProfiles, error: staffAdminError } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['staff', 'admin']);
    
    if (staffAdminError) {
      console.error('❌ Error fetching staff/admin profiles:', staffAdminError);
    } else {
      console.log(`   Found ${staffAdminProfiles.length} staff/admin profiles`);
      staffAdminProfiles.forEach(profile => {
        console.log(`   ✅ ${profile.full_name} (${profile.ic}) - ${profile.role} - ${profile.email}`);
      });
    }
    
    // 3. Check for our specific ICs
    const targetICs = [
      '860612525415', '910404136303', '931113136664', '790817135874', 
      '921201136323', '911007136347', '770626135291', '981013125488'
    ];
    
    console.log('\n🎯 Checking for our target ICs...');
    const { data: targetProfiles, error: targetError } = await supabase
      .from('profiles')
      .select('*')
      .in('ic', targetICs);
    
    if (targetError) {
      console.error('❌ Error fetching target profiles:', targetError);
    } else {
      console.log(`   Found ${targetProfiles.length} profiles with target ICs`);
      targetProfiles.forEach(profile => {
        console.log(`   ✅ ${profile.full_name} (${profile.ic}) - ${profile.role} - ${profile.email}`);
      });
    }
    
    // 4. Check for our specific emails
    const targetEmails = [
      'rinnie.roy@example.com', 'ramadatul.azam@example.com', 'faizatul.farahain@example.com',
      'felicity.buaye@example.com', 'joannes.marvin@example.com', 'mohd.faqrull@example.com',
      'shamsury.majidi@example.com', 'jusnie.gambar@example.com'
    ];
    
    console.log('\n📧 Checking for our target emails...');
    const { data: emailProfiles, error: emailError } = await supabase
      .from('profiles')
      .select('*')
      .in('email', targetEmails);
    
    if (emailError) {
      console.error('❌ Error fetching email profiles:', emailError);
    } else {
      console.log(`   Found ${emailProfiles.length} profiles with target emails`);
      emailProfiles.forEach(profile => {
        console.log(`   ✅ ${profile.full_name} (${profile.ic}) - ${profile.role} - ${profile.email}`);
      });
    }
    
    // 5. Check role distribution
    console.log('\n📈 Role Distribution:');
    const roleDistribution = {};
    allProfiles.forEach(user => {
      roleDistribution[user.role] = (roleDistribution[user.role] || 0) + 1;
    });
    
    Object.entries(roleDistribution).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} users`);
    });
    
    // 6. Check authentication users
    console.log('\n🔐 Authentication Users:');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
    } else {
      console.log(`   Total auth users: ${authUsers.users.length}`);
      
      const targetAuthUsers = authUsers.users.filter(user => targetEmails.includes(user.email));
      console.log(`   Target auth users: ${targetAuthUsers.length}`);
      
      targetAuthUsers.forEach(user => {
        console.log(`   ✅ ${user.email} - ${user.user_metadata?.role || 'no role'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
debugProfiles();
