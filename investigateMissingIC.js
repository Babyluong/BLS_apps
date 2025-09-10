// investigateMissingIC.js
// Investigate why IC numbers are missing from profiles

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function investigateMissingIC() {
  console.log('🔍 Investigating Missing IC Numbers\n');
  console.log('=' .repeat(60));
  
  try {
    // Get profiles without IC
    const { data: profilesWithoutIC, error: fetchError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, email, role, created_at, updated_at')
      .or('ic.is.null,ic.eq.')
      .order('created_at');
    
    if (fetchError) {
      console.log(`❌ Error fetching profiles: ${fetchError.message}`);
      return;
    }
    
    console.log(`📊 Found ${profilesWithoutIC.length} profiles without IC`);
    
    // Analyze creation patterns
    console.log('\n🔍 Analyzing creation patterns...');
    
    const creationDates = profilesWithoutIC.map(p => p.created_at);
    const uniqueDates = [...new Set(creationDates.map(d => d.split('T')[0]))].sort();
    
    console.log('📅 Creation dates:');
    uniqueDates.forEach(date => {
      const count = creationDates.filter(d => d.startsWith(date)).length;
      console.log(`   ${date}: ${count} profiles`);
    });
    
    // Check if these are app-created vs migrated profiles
    console.log('\n🔍 Checking profile creation method...');
    
    const appCreatedProfiles = profilesWithoutIC.filter(p => 
      p.email && !p.email.includes('@hospital-lawas.local')
    );
    
    const systemCreatedProfiles = profilesWithoutIC.filter(p => 
      p.email && p.email.includes('@hospital-lawas.local')
    );
    
    console.log(`   📱 App-created profiles: ${appCreatedProfiles.length}`);
    console.log(`   🏥 System-created profiles: ${systemCreatedProfiles.length}`);
    
    // Check if these profiles exist in the original users table data
    console.log('\n🔍 Checking if profiles exist in original users data...');
    
    // Sample some profiles to check
    const sampleProfiles = profilesWithoutIC.slice(0, 5);
    
    for (const profile of sampleProfiles) {
      console.log(`\n👤 Checking: ${profile.full_name}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Created: ${profile.created_at}`);
      
      // Try to find by name in the original users table structure
      // (We can't query users table anymore, but we can check patterns)
      
      if (profile.email.includes('@hospital-lawas.local')) {
        console.log('   🏥 System-created profile (likely from migration)');
      } else {
        console.log('   📱 App-created profile (likely from registration)');
      }
    }
    
    // Check the migration timeline
    console.log('\n📅 Migration Timeline Analysis:');
    console.log('=' .repeat(60));
    
    const migrationDate = '2025-09-08'; // When we did the migration
    const beforeMigration = profilesWithoutIC.filter(p => 
      p.created_at < migrationDate
    );
    const afterMigration = profilesWithoutIC.filter(p => 
      p.created_at >= migrationDate
    );
    
    console.log(`   Before migration (${migrationDate}): ${beforeMigration.length} profiles`);
    console.log(`   After migration (${migrationDate}): ${afterMigration.length} profiles`);
    
    if (beforeMigration.length > 0) {
      console.log('\n📋 Profiles created before migration:');
      beforeMigration.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.full_name} (${profile.created_at.split('T')[0]})`);
      });
    }
    
    if (afterMigration.length > 0) {
      console.log('\n📋 Profiles created after migration:');
      afterMigration.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.full_name} (${profile.created_at.split('T')[0]})`);
      });
    }
    
    // Check if IC is required for login
    console.log('\n🔍 Login Requirements Analysis:');
    console.log('=' .repeat(60));
    
    console.log('   📱 App-created profiles can login with:');
    console.log('      - Email + Password (IC number)');
    console.log('      - Name + IC number (if IC is provided)');
    console.log('   🏥 System-created profiles can login with:');
    console.log('      - Email + Password (IC number)');
    console.log('      - Name + IC number (if IC is provided)');
    
    // Recommendations
    console.log('\n🔧 RECOMMENDATIONS:');
    console.log('=' .repeat(60));
    
    if (appCreatedProfiles.length > 0) {
      console.log('1. 📱 App-created profiles missing IC:');
      console.log('   - These were created through the app registration');
      console.log('   - IC was not collected during registration');
      console.log('   - Users can still login with email + password');
      console.log('   - Consider adding IC collection to registration form');
    }
    
    if (systemCreatedProfiles.length > 0) {
      console.log('2. 🏥 System-created profiles missing IC:');
      console.log('   - These were created during migration');
      console.log('   - IC should have been migrated from users table');
      console.log('   - May need manual IC addition');
    }
    
    console.log('\n3. 🔄 Next Steps:');
    console.log('   - Test login functionality for profiles without IC');
    console.log('   - Consider if IC is mandatory for all users');
    console.log('   - Update registration form to collect IC');
    console.log('   - Add IC validation to profile updates');
    
  } catch (error) {
    console.error('❌ Investigation failed:', error);
  }
}

// Run the investigation
investigateMissingIC();
