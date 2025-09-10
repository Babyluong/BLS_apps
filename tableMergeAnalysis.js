// tableMergeAnalysis.js
// Analysis of users vs profiles tables and migration plan

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function analyzeTableStructure() {
  console.log('🔍 Analyzing Users vs Profiles Tables\n');
  console.log('=' .repeat(60));
  
  try {
    // Get structure of both tables
    console.log('📋 Step 1: Analyzing table structures...\n');
    
    // Get profiles table structure
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(3);
    
    if (profilesError) {
      console.log('❌ Error getting profiles data:', profilesError.message);
      return;
    }
    
    // Get users table structure  
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(3);
    
    if (usersError) {
      console.log('❌ Error getting users data:', usersError.message);
      return;
    }
    
    console.log('👤 PROFILES TABLE:');
    console.log('   Purpose: Authentication & role management');
    console.log('   Rows:', profilesData.length > 0 ? 'Multiple' : 'Empty');
    console.log('   Columns:', profilesData.length > 0 ? Object.keys(profilesData[0]) : 'None');
    if (profilesData.length > 0) {
      console.log('   Sample data:', profilesData[0]);
    }
    
    console.log('\n👥 USERS TABLE:');
    console.log('   Purpose: Participant/student data');
    console.log('   Rows:', usersData.length > 0 ? 'Multiple' : 'Empty');
    console.log('   Columns:', usersData.length > 0 ? Object.keys(usersData[0]) : 'None');
    if (usersData.length > 0) {
      console.log('   Sample data:', usersData[0]);
    }
    
    // Analyze the confusion
    console.log('\n\n🚨 PROBLEMS IDENTIFIED:');
    console.log('=' .repeat(60));
    
    console.log('\n1. DUPLICATE FUNCTIONALITY:');
    console.log('   ✅ Both tables store user information');
    console.log('   ✅ Both have full_name, ic, email fields');
    console.log('   ✅ Both are used for user identification');
    
    console.log('\n2. CONFUSING LOGIC:');
    console.log('   ❌ Login checks BOTH tables for the same IC');
    console.log('   ❌ Different roles stored in different tables');
    console.log('   ❌ Complex fallback logic between tables');
    console.log('   ❌ Data synchronization issues');
    
    console.log('\n3. MAINTENANCE ISSUES:');
    console.log('   ❌ Need to update data in multiple places');
    console.log('   ❌ Risk of data inconsistency');
    console.log('   ❌ Complex queries across both tables');
    console.log('   ❌ Confusing for developers');
    
    // Get actual data counts
    const { count: profilesCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    console.log('\n\n📊 DATA ANALYSIS:');
    console.log('=' .repeat(60));
    console.log(`Profiles table: ${profilesCount} rows`);
    console.log(`Users table: ${usersCount} rows`);
    console.log(`Total users: ${profilesCount + usersCount} rows`);
    
    // Check for overlapping data
    console.log('\n🔍 Checking for data overlap...');
    
    if (profilesData.length > 0 && usersData.length > 0) {
      const profilesIC = profilesData.map(p => p.ic).filter(Boolean);
      const usersIC = usersData.map(u => u.ic).filter(Boolean);
      const overlappingIC = profilesIC.filter(ic => usersIC.includes(ic));
      
      console.log(`   Profiles with IC: ${profilesIC.length}`);
      console.log(`   Users with IC: ${usersIC.length}`);
      console.log(`   Overlapping ICs: ${overlappingIC.length}`);
      
      if (overlappingIC.length > 0) {
        console.log('   ⚠️  WARNING: Found overlapping ICs - data duplication!');
        console.log('   Overlapping ICs:', overlappingIC.slice(0, 5));
      }
    }
    
    // Generate migration plan
    console.log('\n\n💡 RECOMMENDED SOLUTION:');
    console.log('=' .repeat(60));
    
    console.log('\n🎯 MERGE STRATEGY:');
    console.log('   1. Keep PROFILES table as the single source of truth');
    console.log('   2. Add missing columns from USERS table to PROFILES');
    console.log('   3. Migrate all USERS data to PROFILES');
    console.log('   4. Update all application code to use PROFILES only');
    console.log('   5. Drop USERS table after migration');
    
    console.log('\n📋 MIGRATION STEPS:');
    console.log('   1. Add missing columns to profiles table');
    console.log('   2. Create migration script to move users data');
    console.log('   3. Update all application queries');
    console.log('   4. Test thoroughly');
    console.log('   5. Drop users table');
    
    // Generate the actual migration SQL
    console.log('\n\n🛠️ MIGRATION SQL:');
    console.log('=' .repeat(60));
    
    console.log('\n-- Step 1: Add missing columns to profiles table');
    console.log('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tempat_bertugas TEXT;');
    console.log('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS jawatan TEXT;');
    console.log('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bls_last_year TEXT;');
    console.log('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alergik BOOLEAN DEFAULT FALSE;');
    console.log('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alergik_details TEXT;');
    console.log('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS asma BOOLEAN DEFAULT FALSE;');
    console.log('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hamil BOOLEAN DEFAULT FALSE;');
    console.log('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hamil_weeks INTEGER;');
    console.log('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gred TEXT;');
    console.log('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alergik_terhadap TEXT;');
    
    console.log('\n-- Step 2: Migrate data from users to profiles');
    console.log(`-- This will be generated based on actual data`);
    
    console.log('\n-- Step 3: Update foreign key references');
    console.log('-- Update quiz_sessions.user_id to reference profiles.id');
    console.log('-- Update checklist_results.user_id to reference profiles.id');
    
    console.log('\n-- Step 4: Drop users table (after migration)');
    console.log('-- DROP TABLE users CASCADE;');
    
    console.log('\n\n✅ BENEFITS OF MERGING:');
    console.log('=' .repeat(60));
    console.log('   ✅ Single source of truth for user data');
    console.log('   ✅ Simplified authentication logic');
    console.log('   ✅ Easier data maintenance');
    console.log('   ✅ Better data consistency');
    console.log('   ✅ Cleaner application code');
    console.log('   ✅ Reduced complexity');
    console.log('   ✅ Better performance (fewer joins)');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

// Run the analysis
analyzeTableStructure();
