// migrateUsersToProfiles.js
// Complete migration script to merge users table into profiles table

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrateUsersToProfiles() {
  console.log('🚀 Starting Users to Profiles Migration\n');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Add missing columns to profiles table
    console.log('📋 Step 1: Adding missing columns to profiles table...');
    
    const alterQueries = [
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tempat_bertugas TEXT;',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS jawatan TEXT;',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bls_last_year TEXT;',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alergik BOOLEAN DEFAULT FALSE;',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alergik_details TEXT;',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS asma BOOLEAN DEFAULT FALSE;',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hamil BOOLEAN DEFAULT FALSE;',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hamil_weeks INTEGER;',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gred TEXT;',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alergik_terhadap TEXT;'
    ];
    
    for (const query of alterQueries) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: query });
        if (error) {
          console.log(`   ⚠️  ${query} - ${error.message}`);
        } else {
          console.log(`   ✅ ${query}`);
        }
      } catch (e) {
        console.log(`   ❌ ${query} - ${e.message}`);
      }
    }
    
    // Step 2: Get all users data
    console.log('\n📋 Step 2: Fetching users data...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.log('❌ Error fetching users data:', usersError.message);
      return;
    }
    
    console.log(`   ✅ Found ${usersData.length} users to migrate`);
    
    // Step 3: Get existing profiles to check for conflicts
    console.log('\n📋 Step 3: Checking for existing profiles...');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('ic, id');
    
    if (profilesError) {
      console.log('❌ Error fetching profiles data:', profilesError.message);
      return;
    }
    
    const existingICs = new Set(profilesData.map(p => p.ic).filter(Boolean));
    console.log(`   ✅ Found ${profilesData.length} existing profiles`);
    
    // Step 4: Migrate users data
    console.log('\n📋 Step 4: Migrating users to profiles...');
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const user of usersData) {
      try {
        // Check if profile already exists with this IC
        if (existingICs.has(user.ic)) {
          console.log(`   ⚠️  Skipping ${user.full_name} (IC ${user.ic}) - profile already exists`);
          skippedCount++;
          continue;
        }
        
        // Create new profile for this user
        const profileData = {
          full_name: user.full_name,
          ic: user.ic,
          email: user.email || `${user.ic}@hospital-lawas.local`,
          role: 'user', // Default role for migrated users
          tempat_bertugas: user.tempat_bertugas,
          jawatan: user.jawatan,
          bls_last_year: user.bls_last_year,
          alergik: user.alergik || false,
          alergik_details: user.alergik_details,
          asma: user.asma || false,
          hamil: user.hamil || false,
          hamil_weeks: user.hamil_weeks,
          gred: user.gred,
          alergik_terhadap: user.alergik_terhadap,
          phone_number: user.phone_number
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
    console.log(`   📊 Total processed: ${usersData.length} users`);
    
    // Step 6: Generate next steps
    console.log('\n🔄 NEXT STEPS:');
    console.log('=' .repeat(60));
    console.log('1. ✅ Data migration completed');
    console.log('2. 🔄 Update application code to use profiles only');
    console.log('3. 🧪 Test all functionality thoroughly');
    console.log('4. 🗑️ Drop users table (after testing)');
    
    console.log('\n📝 CODE CHANGES NEEDED:');
    console.log('=' .repeat(60));
    console.log('1. Replace all .from("users") with .from("profiles")');
    console.log('2. Update login logic to check profiles only');
    console.log('3. Update user management screens');
    console.log('4. Update foreign key references');
    
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
migrateUsersToProfiles();
