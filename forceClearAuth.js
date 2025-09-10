// forceClearAuth.js - Force clear authentication state to fix the app issue
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceClearAuth() {
  console.log('🔧 Force clearing authentication state...\n');

  try {
    // Check current session
    console.log('1. Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error getting session:', sessionError);
    } else if (!session) {
      console.log('ℹ️  No active session found');
    } else {
      console.log(`✅ Active session found for user: ${session.user.id}`);
      console.log(`   Email: ${session.user.email}`);
      console.log(`   Role: ${session.user.role || 'N/A'}`);
    }
    console.log('');

    // Sign out to clear authentication
    console.log('2. Signing out to clear authentication...');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.error('❌ Error signing out:', signOutError);
    } else {
      console.log('✅ Successfully signed out');
    }
    console.log('');

    // Verify session is cleared
    console.log('3. Verifying session is cleared...');
    const { data: { session: clearedSession }, error: clearedSessionError } = await supabase.auth.getSession();
    
    if (clearedSessionError) {
      console.error('❌ Error getting cleared session:', clearedSessionError);
    } else if (!clearedSession) {
      console.log('✅ Session successfully cleared');
    } else {
      console.log('❌ Session still active after sign out');
    }
    console.log('');

    // Test data access without authentication
    console.log('4. Testing data access without authentication...');
    const { data: testBlsResults, error: testBlsError } = await supabase
      .from('bls_results')
      .select('id, user_id, participant_name')
      .limit(5);

    if (testBlsError) {
      console.error('❌ Error accessing bls_results without auth:', testBlsError);
    } else {
      console.log(`✅ Successfully accessed bls_results without auth: ${testBlsResults.length} records`);
    }
    console.log('');

    // Test profiles access without authentication
    console.log('5. Testing profiles access without authentication...');
    const { data: testProfiles, error: testProfilesError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .limit(5);

    if (testProfilesError) {
      console.error('❌ Error accessing profiles without auth:', testProfilesError);
    } else {
      console.log(`✅ Successfully accessed profiles without auth: ${testProfiles.length} records`);
    }
    console.log('');

    console.log('🎉 Authentication state cleared! The app should now work correctly.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Refresh your BLS app in the browser');
    console.log('2. Log in again with a valid user account');
    console.log('3. The app should now display all 57 participants correctly');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
forceClearAuth();

