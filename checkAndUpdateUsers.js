// checkAndUpdateUsers.js
// Check existing users and update their roles

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkAndUpdateUsers() {
  console.log('🔍 Checking existing users and updating roles...\n');
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
    
    console.log('🔍 Checking existing profiles...');
    
    for (const user of allUsers) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, full_name, role, ic, email')
        .eq('ic', user.ic)
        .limit(1);
      
      if (existing && existing.length > 0) {
        const profile = existing[0];
        console.log(`✅ Found: ${profile.full_name} (IC: ${profile.ic}, Current Role: ${profile.role})`);
        
        // Update role if different
        if (profile.role !== user.role) {
          console.log(`   🔄 Updating role from "${profile.role}" to "${user.role}"...`);
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: user.role })
            .eq('id', profile.id);
          
          if (updateError) {
            console.log(`   ❌ Error updating role: ${updateError.message}`);
          } else {
            console.log(`   ✅ Successfully updated role to "${user.role}"`);
          }
        } else {
          console.log(`   ✅ Role is already correct (${user.role})`);
        }
      } else {
        console.log(`❌ Not found: ${user.name} (IC: ${user.ic}) - needs to be created`);
      }
    }
    
    // Check auth users for the missing ones
    console.log('\n🔍 Checking auth users for missing profiles...');
    
    for (const user of allUsers) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('ic', user.ic)
        .limit(1);
      
      if (!existing || existing.length === 0) {
        console.log(`\n➕ Need to create profile for: ${user.name} (${user.role})`);
        
        // Try to find by email pattern
        const email = `${user.ic}@hospital-lawas.local`;
        console.log(`   Looking for auth user with email: ${email}`);
        
        // We can't directly query auth.users, but we can try to create the profile
        // and see if the auth user exists
        try {
          // First, let's try to create a temporary profile to see what happens
          const { data: tempProfile, error: tempError } = await supabase
            .from('profiles')
            .insert({
              full_name: user.name,
              ic: user.ic,
              role: user.role,
              email: email
            })
            .select()
            .single();
          
          if (tempError) {
            if (tempError.message.includes('violates foreign key constraint')) {
              console.log(`   ❌ Auth user doesn't exist for ${user.name} - need to create auth user first`);
            } else {
              console.log(`   ❌ Error: ${tempError.message}`);
            }
          } else {
            console.log(`   ✅ Successfully created profile for ${user.name}`);
          }
        } catch (error) {
          console.log(`   ❌ Error creating profile: ${error.message}`);
        }
      }
    }
    
    // Final verification
    console.log('\n📊 Final verification - all users by role:');
    console.log('=' .repeat(60));
    
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
checkAndUpdateUsers();
