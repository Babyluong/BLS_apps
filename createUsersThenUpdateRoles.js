// createUsersThenUpdateRoles.js
// Create users as regular users first, then update their roles

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUsersThenUpdateRoles() {
  console.log('🔧 Creating users as regular users first, then updating roles...\n');
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
    
    console.log('📋 Users to create:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.role}) - IC: ${user.ic}`);
    });
    
    let successCount = 0;
    let errorCount = 0;
    
    console.log('\n🚀 Step 1: Creating users as regular users...');
    console.log('=' .repeat(60));
    
    for (const user of allUsers) {
      try {
        console.log(`\n➕ Creating ${user.name}...`);
        
        // Check if user already exists
        const { data: existing } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .eq('ic', user.ic)
          .limit(1);
        
        if (existing && existing.length > 0) {
          console.log(`   ⚠️  User already exists: ${existing[0].full_name} (${existing[0].role})`);
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
        
        // Create profile as regular user first
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: user.name,
            ic: user.ic,
            role: 'user', // Start as regular user
            email: email
          });
        
        if (profileError) {
          console.log(`   ❌ Error creating profile: ${profileError.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Successfully created ${user.name} as regular user`);
          successCount++;
        }
        
      } catch (error) {
        console.log(`   ❌ Error creating ${user.name}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n🔄 Step 2: Updating roles to admin/staff...');
    console.log('=' .repeat(60));
    
    // Now update the roles
    for (const user of allUsers) {
      try {
        console.log(`\n🔄 Updating ${user.name} to ${user.role}...`);
        
        const { data: existing } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .eq('ic', user.ic)
          .limit(1);
        
        if (!existing || existing.length === 0) {
          console.log(`   ❌ User not found: ${user.name}`);
          continue;
        }
        
        const profile = existing[0];
        
        if (profile.role === user.role) {
          console.log(`   ✅ Role is already correct (${user.role})`);
          continue;
        }
        
        // Update role
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: user.role })
          .eq('id', profile.id);
        
        if (updateError) {
          console.log(`   ❌ Error updating role: ${updateError.message}`);
        } else {
          console.log(`   ✅ Successfully updated ${user.name} to ${user.role}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error updating ${user.name}: ${error.message}`);
      }
    }
    
    console.log('\n📊 Final Summary:');
    console.log('=' .repeat(60));
    console.log(`✅ Users created: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    // Final verification
    console.log('\n🔍 Final verification - all users by role:');
    console.log('=' .repeat(60));
    
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('full_name, ic, role')
      .in('ic', allUsers.map(u => u.ic))
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
      users.forEach(profile => {
        console.log(`   ${profile.full_name} (IC: ${profile.ic})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
createUsersThenUpdateRoles();
