// simpleMigration.js
// Simplified migration that works with existing table structure

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function simpleMigration() {
  console.log('🚀 Starting Simplified Migration\n');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Check current table structures
    console.log('📋 Step 1: Checking current table structures...\n');
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Error getting profiles data:', profilesError.message);
      return;
    }
    
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('❌ Error getting users data:', usersError.message);
      return;
    }
    
    console.log('👤 PROFILES TABLE COLUMNS:');
    if (profilesData.length > 0) {
      console.log('   ', Object.keys(profilesData[0]).join(', '));
    }
    
    console.log('\n👥 USERS TABLE COLUMNS:');
    if (usersData.length > 0) {
      console.log('   ', Object.keys(usersData[0]).join(', '));
    }
    
    // Step 2: Get all users data
    console.log('\n📋 Step 2: Fetching all users data...');
    const { data: allUsersData, error: allUsersError } = await supabase
      .from('users')
      .select('*');
    
    if (allUsersError) {
      console.log('❌ Error fetching all users data:', allUsersError.message);
      return;
    }
    
    console.log(`   ✅ Found ${allUsersData.length} users to migrate`);
    
    // Step 3: Get existing profiles to check for conflicts
    console.log('\n📋 Step 3: Checking for existing profiles...');
    const { data: allProfilesData, error: allProfilesError } = await supabase
      .from('profiles')
      .select('ic, id, full_name');
    
    if (allProfilesError) {
      console.log('❌ Error fetching profiles data:', allProfilesError.message);
      return;
    }
    
    const existingICs = new Set(allProfilesData.map(p => p.ic).filter(Boolean));
    const existingNames = new Set(allProfilesData.map(p => p.full_name?.toLowerCase()).filter(Boolean));
    
    console.log(`   ✅ Found ${allProfilesData.length} existing profiles`);
    console.log(`   ✅ Found ${existingICs.size} unique ICs in profiles`);
    
    // Step 4: Migrate users data (only fields that exist in profiles)
    console.log('\n📋 Step 4: Migrating users to profiles...');
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const user of allUsersData) {
      try {
        // Check if profile already exists with this IC or name
        if (existingICs.has(user.ic) || existingNames.has(user.full_name?.toLowerCase())) {
          console.log(`   ⚠️  Skipping ${user.full_name} (IC ${user.ic}) - profile already exists`);
          skippedCount++;
          continue;
        }
        
        // Create new profile for this user (only with fields that exist in profiles)
        const profileData = {
          full_name: user.full_name,
          ic: user.ic,
          email: user.email || `${user.ic}@hospital-lawas.local`,
          role: 'user', // Default role for migrated users
          // Only include fields that exist in profiles table
          tempat_bertugas: user.tempat_bertugas || null,
          jawatan: user.jawatan || null,
          phone_number: user.phone_number || null
        };
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();
        
        if (insertError) {
          console.log(`   ❌ Error migrating ${user.full_name}: ${insertError.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Migrated ${user.full_name} (IC: ${user.ic})`);
          migratedCount++;
        }
        
      } catch (error) {
        console.log(`   ❌ Error migrating ${user.full_name}: ${error.message}`);
        errorCount++;
      }
    }
    
    // Step 5: Summary
    console.log('\n📊 MIGRATION SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`   ✅ Successfully migrated: ${migratedCount} users`);
    console.log(`   ⚠️  Skipped (already exists): ${skippedCount} users`);
    console.log(`   ❌ Errors: ${errorCount} users`);
    console.log(`   📊 Total processed: ${allUsersData.length} users`);
    
    // Step 6: Check final counts
    console.log('\n📋 Step 5: Verifying final counts...');
    const { count: finalProfilesCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    const { count: finalUsersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   📊 Final profiles count: ${finalProfilesCount}`);
    console.log(`   📊 Final users count: ${finalUsersCount}`);
    
    // Step 7: Generate next steps
    console.log('\n🔄 NEXT STEPS:');
    console.log('=' .repeat(60));
    console.log('1. ✅ Basic data migration completed');
    console.log('2. 🔄 Add missing columns to profiles table manually');
    console.log('3. 🔄 Update application code to use profiles only');
    console.log('4. 🧪 Test all functionality thoroughly');
    console.log('5. 🗑️ Drop users table (after testing)');
    
    console.log('\n📝 MANUAL STEPS REQUIRED:');
    console.log('=' .repeat(60));
    console.log('1. Go to Supabase Dashboard > Table Editor > profiles');
    console.log('2. Add these columns manually:');
    console.log('   - bls_last_year (TEXT)');
    console.log('   - alergik (BOOLEAN)');
    console.log('   - alergik_details (TEXT)');
    console.log('   - asma (BOOLEAN)');
    console.log('   - hamil (BOOLEAN)');
    console.log('   - hamil_weeks (INTEGER)');
    console.log('   - gred (TEXT)');
    console.log('   - alergik_terhadap (TEXT)');
    console.log('3. Then run the full migration again');
    
    console.log('\n⚠️  IMPORTANT NOTES:');
    console.log('=' .repeat(60));
    console.log('• All migrated users have role="user" by default');
    console.log('• Update roles manually for staff/admin users');
    console.log('• Test login functionality thoroughly');
    console.log('• Backup database before dropping users table');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
simpleMigration();
