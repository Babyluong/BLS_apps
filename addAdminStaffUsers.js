// addAdminStaffUsers.js
// Add missing admin and staff users to profiles table

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addAdminStaffUsers() {
  console.log('🔧 Adding missing admin and staff users to profiles table...\n');
  console.log('=' .repeat(60));
  
  try {
    // Define the missing users
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
    
    console.log('📋 Staff users to add:');
    staffUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (IC: ${user.ic})`);
    });
    
    console.log('\n📋 Admin users to add:');
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (IC: ${user.ic})`);
    });
    
    // Check which users already exist
    console.log('\n🔍 Checking which users already exist...');
    
    const allUsers = [...staffUsers.map(u => ({...u, role: 'staff'})), ...adminUsers.map(u => ({...u, role: 'admin'}))];
    
    for (const user of allUsers) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, full_name, role, ic')
        .eq('ic', user.ic)
        .limit(1);
      
      if (existing && existing.length > 0) {
        console.log(`⚠️  User already exists: ${existing[0].full_name} (IC: ${existing[0].ic}, Role: ${existing[0].role})`);
      } else {
        console.log(`✅ Ready to add: ${user.name} (${user.role})`);
      }
    }
    
    console.log('\n🚀 Starting to add users...');
    console.log('=' .repeat(60));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const user of allUsers) {
      try {
        console.log(`\n➕ Adding ${user.name} (${user.role})...`);
        
        // Check if user already exists
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('ic', user.ic)
          .limit(1);
        
        if (existing && existing.length > 0) {
          console.log(`   ⚠️  User already exists, skipping...`);
          continue;
        }
        
        // Create auth user first
        const email = `${user.ic}@hospital-lawas.local`;
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: email,
          password: user.ic, // Use IC as password
          email_confirm: true
        });
        
        if (authError) {
          console.log(`   ❌ Error creating auth user: ${authError.message}`);
          errorCount++;
          continue;
        }
        
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: user.name,
            ic: user.ic,
            role: user.role,
            email: email
          });
        
        if (profileError) {
          console.log(`   ❌ Error creating profile: ${profileError.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Successfully added ${user.name} as ${user.role}`);
          successCount++;
        }
        
      } catch (error) {
        console.log(`   ❌ Error adding ${user.name}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log('=' .repeat(60));
    console.log(`✅ Successfully added: ${successCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);
    console.log(`📋 Total processed: ${allUsers.length} users`);
    
    // Verify the additions
    console.log('\n🔍 Verifying additions...');
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('full_name, ic, role')
      .in('ic', allUsers.map(u => u.ic))
      .order('role', { ascending: true });
    
    if (allProfiles && allProfiles.length > 0) {
      console.log('\n📋 Added users in database:');
      allProfiles.forEach(profile => {
        console.log(`   ${profile.role.toUpperCase()}: ${profile.full_name} (IC: ${profile.ic})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
addAdminStaffUsers();
