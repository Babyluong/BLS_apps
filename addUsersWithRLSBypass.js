// addUsersWithRLSBypass.js
// Add admin and staff users by temporarily modifying RLS policies

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addUsersWithRLSBypass() {
  console.log('🔧 Adding admin and staff users with RLS bypass...\n');
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
    
    console.log('📋 Users to add:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.role}) - IC: ${user.ic}`);
    });
    
    // Step 1: Temporarily disable RLS for profiles table
    console.log('\n🔧 Step 1: Temporarily disabling RLS...');
    
    const { error: disableRLSError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;'
    });
    
    if (disableRLSError) {
      console.log(`❌ Error disabling RLS: ${disableRLSError.message}`);
      return;
    }
    
    console.log('✅ RLS disabled successfully');
    
    // Step 2: Add all users
    console.log('\n🚀 Step 2: Adding users...');
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
          successCount++;
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
        
        // Create profile with the correct role
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
    
    // Step 3: Re-enable RLS
    console.log('\n🔧 Step 3: Re-enabling RLS...');
    
    const { error: enableRLSError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;'
    });
    
    if (enableRLSError) {
      console.log(`❌ Error re-enabling RLS: ${enableRLSError.message}`);
    } else {
      console.log('✅ RLS re-enabled successfully');
    }
    
    // Step 4: Final verification
    console.log('\n📊 Final Summary:');
    console.log('=' .repeat(60));
    console.log(`✅ Successfully added: ${successCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);
    
    // Verify the additions
    console.log('\n🔍 Final verification...');
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('full_name, ic, role')
      .in('ic', allUsers.map(u => u.ic))
      .order('role', { ascending: true });
    
    if (allProfiles && allProfiles.length > 0) {
      const admins = allProfiles.filter(p => p.role === 'admin');
      const staff = allProfiles.filter(p => p.role === 'staff');
      
      console.log(`\n👑 ADMIN USERS (${admins.length}):`);
      admins.forEach(profile => {
        console.log(`   ${profile.full_name} (IC: ${profile.ic})`);
      });
      
      console.log(`\n👥 STAFF USERS (${staff.length}):`);
      staff.forEach(profile => {
        console.log(`   ${profile.full_name} (IC: ${profile.ic})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
addUsersWithRLSBypass();
