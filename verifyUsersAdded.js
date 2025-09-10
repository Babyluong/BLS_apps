// verifyUsersAdded.js
// Verify if the admin and staff users were added successfully

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyUsersAdded() {
  console.log('🔍 Verifying admin and staff users in profiles table...\n');
  console.log('=' .repeat(60));
  
  try {
    const staffUsers = [
      { name: 'RINNIE ROY YABIL', ic: '860612525415' },
      { name: 'RAMADATUL AZAM', ic: '910404136303' },
      { name: 'FAIZATUL FARAHAIN BINTI JAKA', ic: '931113136664' },
      { name: 'Felicity Buaye', ic: '790817135874' },
      { name: 'JOANNES MARVIN ANAK SUBAH', ic: '921201136323' },
      { name: 'MOHD FAQRULL IZAT BIN HANAPI', ic: '911007136347' }
    ];
    
    const adminUsers = [
      { name: 'Shamsury bin Mohamad Majidi', ic: '770626135291' },
      { name: 'JUSNIE GAMBAR', ic: '981013125488' },
      { name: 'amri amit', ic: '940120126733' }
    ];
    
    const allUsers = [...staffUsers.map(u => ({...u, role: 'staff'})), ...adminUsers.map(u => ({...u, role: 'admin'}))];
    
    console.log('🔍 Checking for specific users...');
    
    let foundCount = 0;
    let notFoundCount = 0;
    
    for (const user of allUsers) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, full_name, role, ic, email')
        .eq('ic', user.ic)
        .limit(1);
      
      if (existing && existing.length > 0) {
        const profile = existing[0];
        console.log(`✅ Found: ${profile.full_name} (IC: ${profile.ic}, Role: ${profile.role})`);
        foundCount++;
      } else {
        console.log(`❌ Not found: ${user.name} (IC: ${user.ic})`);
        notFoundCount++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Found: ${foundCount} users`);
    console.log(`❌ Not found: ${notFoundCount} users`);
    
    // Show all users by role
    console.log('\n📋 All users by role:');
    console.log('=' .repeat(60));
    
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('full_name, ic, role')
      .order('role', { ascending: true });
    
    if (allProfiles && allProfiles.length > 0) {
      const admins = allProfiles.filter(p => p.role === 'admin');
      const staff = allProfiles.filter(p => p.role === 'staff');
      const users = allProfiles.filter(p => p.role === 'user');
      
      console.log(`\n👑 ADMIN USERS (${admins.length}):`);
      admins.forEach(profile => {
        console.log(`   ${profile.full_name} (IC: ${profile.ic})`);
      });
      
      console.log(`\n👥 STAFF USERS (${staff.length}):`);
      staff.forEach(profile => {
        console.log(`   ${profile.full_name} (IC: ${profile.ic})`);
      });
      
      console.log(`\n👤 REGULAR USERS (${users.length}):`);
      console.log(`   (Showing first 10 of ${users.length} users)`);
      users.slice(0, 10).forEach(profile => {
        console.log(`   ${profile.full_name} (IC: ${profile.ic})`);
      });
      if (users.length > 10) {
        console.log(`   ... and ${users.length - 10} more users`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the verification
verifyUsersAdded();
