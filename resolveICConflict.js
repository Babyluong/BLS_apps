// resolveICConflict.js
// Resolve IC conflict between AWANGKU MOHAMAD ZULFAZLI and MOHAMAD FARIZZUL BIN JAYA

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resolveICConflict() {
  console.log('🔍 Resolving IC Conflict\n');
  console.log('=' .repeat(60));
  
  try {
    const conflictingIC = "950821136503";
    const targetName = "AWANGKU MOHAMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK";
    
    // Get both profiles
    const { data: targetProfile, error: targetError } = await supabase
      .from('profiles')
      .select('*')
      .eq('full_name', targetName)
      .single();
    
    const { data: conflictingProfile, error: conflictingError } = await supabase
      .from('profiles')
      .select('*')
      .eq('ic', conflictingIC)
      .single();
    
    if (targetError || conflictingError) {
      console.log('❌ Error fetching profiles');
      return;
    }
    
    console.log('📊 CONFLICTING PROFILES:');
    console.log('=' .repeat(60));
    
    console.log('\n👤 Profile 1 (Has the IC):');
    console.log(`   Name: ${conflictingProfile.full_name}`);
    console.log(`   Email: ${conflictingProfile.email}`);
    console.log(`   IC: ${conflictingProfile.ic}`);
    console.log(`   Auth ID: ${conflictingProfile.id}`);
    console.log(`   Created: ${conflictingProfile.created_at}`);
    
    console.log('\n👤 Profile 2 (Wants the IC):');
    console.log(`   Name: ${targetProfile.full_name}`);
    console.log(`   Email: ${targetProfile.email}`);
    console.log(`   IC: ${targetProfile.ic || 'NULL'}`);
    console.log(`   Auth ID: ${targetProfile.id}`);
    console.log(`   Created: ${targetProfile.created_at}`);
    
    // Check if they might be the same person
    console.log('\n🔍 ANALYSIS:');
    console.log('=' .repeat(60));
    
    const nameSimilarity = targetProfile.full_name.toUpperCase().includes('AWANGKU') && 
                          conflictingProfile.full_name.toUpperCase().includes('AWANGKU');
    
    const emailSimilarity = targetProfile.email.includes('awangku') || 
                           conflictingProfile.email.includes('awangku');
    
    console.log(`   Name similarity: ${nameSimilarity ? 'YES' : 'NO'}`);
    console.log(`   Email similarity: ${emailSimilarity ? 'YES' : 'NO'}`);
    console.log(`   IC conflict: YES (${conflictingIC})`);
    
    // Show resolution options
    console.log('\n🔧 RESOLUTION OPTIONS:');
    console.log('=' .repeat(60));
    
    console.log('\n1. 🗑️  REMOVE IC from conflicting profile:');
    console.log(`   - Remove IC from: ${conflictingProfile.full_name}`);
    console.log(`   - Add IC to: ${targetProfile.full_name}`);
    console.log('   - Risk: Conflicting profile loses IC');
    
    console.log('\n2. 🔄 SWAP ICs (if you have another IC for conflicting profile):');
    console.log(`   - Keep IC ${conflictingIC} with: ${conflictingProfile.full_name}`);
    console.log(`   - Use different IC for: ${targetProfile.full_name}`);
    console.log('   - Risk: Need to find correct IC for target profile');
    
    console.log('\n3. 🗑️  DELETE conflicting profile (if duplicate):');
    console.log(`   - Delete: ${conflictingProfile.full_name}`);
    console.log(`   - Add IC to: ${targetProfile.full_name}`);
    console.log('   - Risk: Permanent data loss');
    
    console.log('\n4. ✅ KEEP current state:');
    console.log(`   - Leave IC with: ${conflictingProfile.full_name}`);
    console.log(`   - Leave target profile without IC`);
    console.log('   - Risk: Target profile cannot use Name + IC login');
    
    // Generate resolution scripts
    console.log('\n🔧 GENERATED RESOLUTION SCRIPTS:');
    console.log('=' .repeat(60));
    
    console.log('\n📝 Option 1 - Remove IC from conflicting profile:');
    console.log('```javascript');
    console.log('// Remove IC from conflicting profile');
    console.log(`await supabase.from('profiles').update({ ic: null }).eq('id', '${conflictingProfile.id}');`);
    console.log('// Add IC to target profile');
    console.log(`await supabase.from('profiles').update({ ic: '${conflictingIC}' }).eq('id', '${targetProfile.id}');`);
    console.log('```');
    
    console.log('\n📝 Option 2 - Delete conflicting profile:');
    console.log('```javascript');
    console.log('// Delete conflicting profile');
    console.log(`await supabase.from('profiles').delete().eq('id', '${conflictingProfile.id}');`);
    console.log('// Add IC to target profile');
    console.log(`await supabase.from('profiles').update({ ic: '${conflictingIC}' }).eq('id', '${targetProfile.id}');`);
    console.log('```');
    
    console.log('\n💡 RECOMMENDATION:');
    console.log('=' .repeat(60));
    console.log('Based on the analysis, I recommend:');
    
    if (nameSimilarity || emailSimilarity) {
      console.log('✅ These appear to be the same person - DELETE the conflicting profile');
      console.log('   and assign the IC to the target profile.');
    } else {
      console.log('⚠️  These appear to be different people - use a different IC');
      console.log('   for the target profile or remove the IC from the conflicting profile.');
    }
    
    console.log('\n🔄 NEXT STEPS:');
    console.log('1. Choose a resolution option');
    console.log('2. Run the appropriate script');
    console.log('3. Verify the conflict is resolved');
    console.log('4. Complete the migration');
    
  } catch (error) {
    console.error('❌ Process failed:', error);
  }
}

// Run the conflict resolution
resolveICConflict();
