// findAvailableUserID.js - Find an available user ID to use for the participant
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findAvailableUserID() {
  console.log('🔍 Finding an available user ID for AWANGKU MOHAMAD ZULFAZLI...\n');

  try {
    // Get all existing user IDs from profiles
    console.log('1. Getting all existing user IDs from profiles...');
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, ic, full_name, role')
      .order('created_at');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    console.log(`Found ${existingProfiles.length} existing profiles`);
    console.log('');

    // Check if AWANGKU MOHAMAD ZULFAZLI already exists
    const existingParticipant = existingProfiles.find(p => p.ic === '950821136503');
    if (existingParticipant) {
      console.log('✅ AWANGKU MOHAMAD ZULFAZLI already exists in profiles:');
      console.log(`- Name: ${existingParticipant.full_name}`);
      console.log(`- IC: ${existingParticipant.ic}`);
      console.log(`- User ID: ${existingParticipant.id}`);
      console.log(`- Role: ${existingParticipant.role}`);
      console.log('');
      
      // Check if he's already a user (participant)
      if (existingParticipant.role === 'user') {
        console.log('🎉 AWANGKU MOHAMAD ZULFAZLI is already a participant!');
        
        // Count total participants
        const userProfiles = existingProfiles.filter(p => p.role === 'user');
        console.log(`Total participants: ${userProfiles.length}`);
        
        if (userProfiles.length === 57) {
          console.log('✅ Perfect! We already have exactly 57 participants');
        } else {
          console.log(`⚠️  We have ${userProfiles.length} participants (expected 57)`);
        }
        
        return;
      } else {
        console.log('⚠️  AWANGKU MOHAMAD ZULFAZLI exists but is not a participant (role: ' + existingParticipant.role + ')');
        console.log('Updating his role to user...');
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            role: 'user',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingParticipant.id);

        if (updateError) {
          console.error('❌ Error updating role:', updateError.message);
        } else {
          console.log('✅ Successfully updated role to user');
          
          // Count total participants
          const { count: userCount, error: countError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'user');

          if (countError) {
            console.error('❌ Error counting user profiles:', countError);
          } else {
            console.log(`Total participants: ${userCount}`);
            
            if (userCount === 57) {
              console.log('🎉 Perfect! We now have exactly 57 participants');
            } else {
              console.log(`⚠️  We have ${userCount} participants (expected 57)`);
            }
          }
        }
        
        return;
      }
    }

    // If not found, try to find a user ID that's not being used
    console.log('2. AWANGKU MOHAMAD ZULFAZLI not found in profiles. Looking for available user ID...');
    
    // Get all user IDs from bls_results
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('user_id')
      .not('user_id', 'is', null);

    if (blsError) {
      console.error('❌ Error fetching bls_results:', blsError);
      return;
    }

    const blsUserIds = new Set(blsResults.map(r => r.user_id));
    console.log(`Found ${blsUserIds.size} user IDs in bls_results`);
    
    // Find a user ID that exists in bls_results but not in profiles
    const availableUserIds = [];
    for (const userId of blsUserIds) {
      const existsInProfiles = existingProfiles.some(p => p.id === userId);
      if (!existsInProfiles) {
        availableUserIds.push(userId);
      }
    }

    if (availableUserIds.length > 0) {
      console.log(`Found ${availableUserIds.length} available user IDs:`);
      availableUserIds.forEach((userId, index) => {
        console.log(`${index + 1}. ${userId}`);
      });
      
      // Use the first available user ID
      const selectedUserId = availableUserIds[0];
      console.log(`\n3. Using user ID: ${selectedUserId}`);
      
      // Create the profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: selectedUserId,
          ic: '950821136503',
          full_name: 'AWANGKU MOHAMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK',
          email: 'awangku7467@gmail.com',
          jawatan: 'PEGAWAI PERUBATAN',
          job_position: 'PEGAWAI PERUBATAN',
          tempat_bertugas: 'HOSPITAL LAWAS',
          gred: 'UD 10',
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('❌ Error creating profile:', insertError.message);
      } else {
        console.log('✅ Successfully created profile for AWANGKU MOHAMAD ZULFAZLI');
        
        // Count total participants
        const { count: userCount, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'user');

        if (countError) {
          console.error('❌ Error counting user profiles:', countError);
        } else {
          console.log(`Total participants: ${userCount}`);
          
          if (userCount === 57) {
            console.log('🎉 Perfect! We now have exactly 57 participants');
          } else {
            console.log(`⚠️  We have ${userCount} participants (expected 57)`);
          }
        }
      }
    } else {
      console.log('❌ No available user IDs found. All user IDs in bls_results are already used in profiles.');
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
findAvailableUserID();

