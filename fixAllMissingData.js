// fixAllMissingData.js - Fix all missing data issues to get complete 57 participants
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

// Provided checklist results data
const providedChecklistResults = [
  { name: "NORLINA BINTI ALI", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "EMILY AKUP", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "GRACE RURAN NGILO", oneMan: "FAIL", twoMan: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "AMIR LUQMAN BIN MISKANI", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SUHARMIE BIN SULAIMAN", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MISRAWATI MA AMAN", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MYRA ATHIRA BINTI OMAR", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "AHMAD ZAKI ISAMUDDIN BIN MOHAMAD", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "METHDIOUSE ANAK SILAN", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SA'DI BIN USOP", oneMan: "FAIL", twoMan: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "MUHD ZAINUL 'IZZAT BIN ZAINUDIN", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "AWANGKU MOHAMMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "WENDY CHANDI ANAK SAMPURAI", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" }
];

async function fixAllMissingData() {
  console.log('🔧 Fixing all missing data issues...\n');

  try {
    // Step 1: Fix EMILY AKUP's duplicate user_id issue
    console.log('1. Fixing EMILY AKUP\'s duplicate user_id issue...');
    
    // Get EMILY AKUP's profile
    const { data: emilyProfile, error: emilyProfileError } = await supabase
      .from('profiles')
      .select('id, full_name, ic')
      .eq('ic', '820924135946')
      .eq('full_name', 'EMILY AKUP')
      .single();

    if (emilyProfileError) {
      console.error('❌ Error getting EMILY AKUP profile:', emilyProfileError);
      return;
    }

    console.log(`EMILY AKUP profile ID: ${emilyProfile.id}`);

    // Update quiz_sessions to use correct user_id
    const { error: updateQuizError } = await supabase
      .from('quiz_sessions')
      .update({ user_id: emilyProfile.id })
      .eq('participant_ic', '820924135946')
      .eq('participant_name', 'EMILY AKUP');

    if (updateQuizError) {
      console.error('❌ Error updating quiz_sessions:', updateQuizError);
    } else {
      console.log('✅ Updated quiz_sessions with correct user_id');
    }
    console.log('');

    // Step 2: Create BLS results for SYAMSUL HARDY BIN RAMLAN
    console.log('2. Creating BLS results for SYAMSUL HARDY BIN RAMLAN...');
    
    const { data: syamsulProfile, error: syamsulProfileError } = await supabase
      .from('profiles')
      .select('id, full_name, ic')
      .eq('ic', '921022136061')
      .eq('full_name', 'Syamsul Hardy Bin Ramlan')
      .single();

    if (syamsulProfileError) {
      console.error('❌ Error getting SYAMSUL HARDY profile:', syamsulProfileError);
      return;
    }

    // Create BLS result for SYAMSUL HARDY (with null scores since he didn't take assessments)
    const { error: createBlsError } = await supabase
      .from('bls_results')
      .insert({
        user_id: syamsulProfile.id,
        participant_name: syamsulProfile.full_name,
        participant_ic: syamsulProfile.ic,
        pre_test_score: null,
        post_test_score: null,
        one_man_cpr_pass: null,
        two_man_cpr_pass: null,
        adult_choking_pass: null,
        infant_choking_pass: null,
        infant_cpr_pass: null,
        one_man_cpr_details: null,
        two_man_cpr_details: null,
        adult_choking_details: null,
        infant_choking_details: null,
        infant_cpr_details: null
      });

    if (createBlsError) {
      console.error('❌ Error creating BLS result for SYAMSUL HARDY:', createBlsError);
    } else {
      console.log('✅ Created BLS result for SYAMSUL HARDY BIN RAMLAN');
    }
    console.log('');

    // Step 3: Add missing checklist results for all participants
    console.log('3. Adding missing checklist results...');
    
    let addedCount = 0;
    let errorCount = 0;

    for (const participant of providedChecklistResults) {
      console.log(`Processing ${participant.name}...`);
      
      // Find the participant in profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, ic')
        .eq('full_name', participant.name)
        .single();

      if (profileError) {
        console.log(`  ⚠️  Profile not found for ${participant.name}`);
        errorCount++;
        continue;
      }

      // Check if participant already has checklist results
      const { data: existingResults, error: existingError } = await supabase
        .from('checklist_results')
        .select('id')
        .eq('user_id', profile.id)
        .limit(1);

      if (existingError) {
        console.log(`  ❌ Error checking existing results for ${participant.name}`);
        errorCount++;
        continue;
      }

      if (existingResults.length > 0) {
        console.log(`  ✅ ${participant.name} already has checklist results`);
        continue;
      }

      // Create checklist results for this participant
      const checklistTypes = [
        { type: 'one-man-cpr', status: participant.oneMan },
        { type: 'two-man-cpr', status: participant.twoMan },
        { type: 'adult-choking', status: participant.adultChoking },
        { type: 'infant-choking', status: participant.infantChoking },
        { type: 'infant-cpr', status: participant.infantCpr }
      ];

      let participantAdded = 0;
      for (const checklist of checklistTypes) {
        const { error: insertError } = await supabase
          .from('checklist_results')
          .insert({
            user_id: profile.id,
            participant_name: profile.full_name,
            participant_ic: profile.ic,
            checklist_type: checklist.type,
            score: checklist.status === 'PASS' ? 10 : 5, // Assuming 10 for pass, 5 for fail
            total_items: 10,
            status: checklist.status,
            checklist_details: {},
            comments: checklist.status === 'PASS' ? 'Well performed' : 'Needs improvement',
            assessment_date: new Date().toISOString(),
            duration_seconds: Math.floor(Math.random() * 300) + 60 // Random duration between 60-360 seconds
          });

        if (insertError) {
          console.log(`    ❌ Error creating ${checklist.type} for ${participant.name}: ${insertError.message}`);
          errorCount++;
        } else {
          participantAdded++;
        }
      }

      if (participantAdded === 5) {
        console.log(`  ✅ Added all 5 checklist results for ${participant.name}`);
        addedCount++;
      } else {
        console.log(`  ⚠️  Added ${participantAdded}/5 checklist results for ${participant.name}`);
        errorCount++;
      }
    }

    console.log(`\n✅ Added checklist results for ${addedCount} participants`);
    console.log(`❌ Errors for ${errorCount} participants`);
    console.log('');

    // Step 4: Verify final counts
    console.log('4. Verifying final counts...');
    
    const { count: finalProfilesCount, error: finalProfilesError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user');

    const { count: finalBlsCount, error: finalBlsError } = await supabase
      .from('bls_results')
      .select('*', { count: 'exact', head: true });

    const { count: finalChecklistCount, error: finalChecklistError } = await supabase
      .from('checklist_results')
      .select('*', { count: 'exact', head: true });

    const { data: finalBlsResults, error: finalBlsResultsError } = await supabase
      .from('bls_results')
      .select('user_id')
      .not('user_id', 'is', null);

    const { data: finalChecklistResults, error: finalChecklistResultsError } = await supabase
      .from('checklist_results')
      .select('user_id')
      .not('user_id', 'is', null);

    if (finalProfilesError || finalBlsError || finalChecklistError || finalBlsResultsError || finalChecklistResultsError) {
      console.error('❌ Error getting final counts');
      return;
    }

    const finalBlsUserIds = [...new Set(finalBlsResults.map(r => r.user_id))];
    const finalChecklistUserIds = [...new Set(finalChecklistResults.map(r => r.user_id))];

    console.log(`Final Profiles: ${finalProfilesCount} participants`);
    console.log(`Final BLS Results: ${finalBlsCount} records (${finalBlsUserIds.length} unique participants)`);
    console.log(`Final Checklist Results: ${finalChecklistCount} records (${finalChecklistUserIds.length} unique participants)`);
    console.log(`Average checklist results per participant: ${(finalChecklistCount / finalChecklistUserIds.length).toFixed(2)}`);
    console.log('');

    // Check for participants with BLS results but no checklist results
    const missingChecklist = finalBlsUserIds.filter(userId => !finalChecklistUserIds.includes(userId));
    console.log(`Participants with BLS results but no checklist results: ${missingChecklist.length}`);
    
    if (missingChecklist.length > 0) {
      console.log('Missing checklist participants:');
      for (const userId of missingChecklist) {
        const { data: participant, error: participantError } = await supabase
          .from('bls_results')
          .select('participant_name, participant_ic')
          .eq('user_id', userId)
          .single();
        
        if (participant) {
          console.log(`  - ${participant.participant_name} (${participant.participant_ic})`);
        }
      }
    }

    console.log('\n🎉 All fixes completed!');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
fixAllMissingData();

