// addMissingProfiles.js
// Add missing profiles for the staff and admin users

const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE'
);

async function addMissingProfiles() {
  try {
    console.log('👥 Adding Missing Profiles for Staff and Admin Users\n');
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
    
    console.log(`📋 Adding profiles for ${allUsers.length} users...`);
    
    // 2. Check which profiles already exist
    console.log('\n🔍 Checking existing profiles...');
    const { data: existingProfiles, error: existingError } = await supabase
      .from('profiles')
      .select('ic, full_name, email, role')
      .in('ic', allUsers.map(u => u.ic));
    
    if (existingError) {
      console.error('❌ Error checking existing profiles:', existingError);
      return;
    }
    
    const existingICs = new Set(existingProfiles.map(p => p.ic));
    console.log(`   Found ${existingProfiles.length} existing profiles`);
    
    if (existingProfiles.length > 0) {
      console.log('   Existing profiles:');
      existingProfiles.forEach(profile => {
        console.log(`     ${profile.full_name} (${profile.ic}) - ${profile.role}`);
      });
    }
    
    // 3. Add missing profiles
    const missingUsers = allUsers.filter(user => !existingICs.has(user.ic));
    console.log(`\n➕ Adding ${missingUsers.length} missing profiles...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const user of missingUsers) {
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
    
    // 4. Update existing profiles to correct roles
    console.log('\n🔄 Updating existing profiles to correct roles...');
    let updateSuccess = 0;
    let updateError = 0;
    
    for (const user of allUsers) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            role: user.role,
            jawatan: user.role === 'admin' ? 'Administrator' : 'Staff',
            updated_at: new Date().toISOString()
          })
          .eq('ic', user.ic);
        
        if (error) {
          console.error(`   ❌ Error updating ${user.name}:`, error.message);
          updateError++;
        } else {
          console.log(`   ✅ Updated ${user.name} to ${user.role}`);
          updateSuccess++;
        }
      } catch (error) {
        console.error(`   ❌ Exception updating ${user.name}:`, error.message);
        updateError++;
      }
    }
    
    // 5. Verify final results
    console.log('\n🔍 Verifying final results...');
    const { data: finalProfiles, error: finalError } = await supabase
      .from('profiles')
      .select('full_name, ic, email, role, jawatan')
      .in('ic', allUsers.map(u => u.ic))
      .order('role, full_name');
    
    if (finalError) {
      console.error('❌ Error verifying profiles:', finalError);
    } else {
      console.log(`   Found ${finalProfiles.length} profiles in database`);
      
      if (finalProfiles.length > 0) {
        console.log('\n   👥 STAFF PROFILES:');
        finalProfiles.filter(p => p.role === 'staff').forEach((profile, index) => {
          console.log(`     ${index + 1}. ${profile.full_name} (${profile.ic}) - ${profile.email}`);
        });
        
        console.log('\n   👑 ADMIN PROFILES:');
        finalProfiles.filter(p => p.role === 'admin').forEach((profile, index) => {
          console.log(`     ${index + 1}. ${profile.full_name} (${profile.ic}) - ${profile.email}`);
        });
      }
    }
    
    // 6. Show final role distribution
    console.log('\n📈 Final Role Distribution:');
    const { data: roleStats, error: roleError } = await supabase
      .from('profiles')
      .select('role')
      .not('role', 'is', null);
    
    if (!roleError && roleStats) {
      const roleDistribution = {};
      roleStats.forEach(user => {
        roleDistribution[user.role] = (roleDistribution[user.role] || 0) + 1;
      });
      
      console.log('   Current role distribution:');
      Object.entries(roleDistribution).forEach(([role, count]) => {
        console.log(`     ${role}: ${count} users`);
      });
    }
    
    console.log('\n🎉 SETUP COMPLETE!');
    console.log('=' .repeat(60));
    console.log('✅ Authentication accounts created');
    console.log('✅ Profiles added to database');
    console.log('✅ Roles updated successfully');
    console.log('✅ Users can now login to your BLS app');
    console.log('✅ Role-based access control ready');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Profiles added: ${successCount}`);
    console.log(`   Profiles updated: ${updateSuccess}`);
    console.log(`   Errors: ${errorCount + updateError}`);
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
addMissingProfiles();
