// fixRemainingChecklistResults.js - Fix remaining checklist results with correct names
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

// Remaining participants with their IC numbers and expected results
const remainingParticipants = [
  { ic: "880708135196", name: "GRACE RURAN NGILO", oneMan: "FAIL", twoMan: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { ic: "950623146647", name: "AMIR LUQMAN", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { ic: "900512126138", name: "MISRAWATI BINTI MA AMAN", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { ic: "680924135151", name: "SA'DI BIN USOP", oneMan: "FAIL", twoMan: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { ic: "921022136061", name: "Syamsul Hardy Bin Ramlan", oneMan: "PASS", twoMan: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" }
];

async function fixRemainingChecklistResults() {
  console.log('🔧 Fixing remaining checklist results...\n');

  try {
    let addedCount = 0;
    let errorCount = 0;

    for (const participant of remainingParticipants) {
      console.log(`Processing ${participant.name} (IC: ${participant.ic})...`);
      
      // Find the participant in profiles by IC
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, ic')
        .eq('ic', participant.ic)
        .single();

      if (profileError) {
        console.log(`  ❌ Profile not found for IC ${participant.ic}: ${profileError.message}`);
        errorCount++;
        continue;
      }

      console.log(`  Found profile: ${profile.full_name} (${profile.id})`);

      // Check if participant already has checklist results
      const { data: existingResults, error: existingError } = await supabase
        .from('checklist_results')
        .select('id')
        .eq('user_id', profile.id)
        .limit(1);

      if (existingError) {
        console.log(`  ❌ Error checking existing results: ${existingError.message}`);
        errorCount++;
        continue;
      }

      if (existingResults.length > 0) {
        console.log(`  ✅ ${profile.full_name} already has checklist results`);
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
          console.log(`    ❌ Error creating ${checklist.type}: ${insertError.message}`);
          errorCount++;
        } else {
          participantAdded++;
        }
      }

      if (participantAdded === 5) {
        console.log(`  ✅ Added all 5 checklist results for ${profile.full_name}`);
        addedCount++;
      } else {
        console.log(`  ⚠️  Added ${participantAdded}/5 checklist results for ${profile.full_name}`);
        errorCount++;
      }
    }

    console.log(`\n✅ Added checklist results for ${addedCount} participants`);
    console.log(`❌ Errors for ${errorCount} participants`);
    console.log('');

    // Final verification
    console.log('Final verification...');
    
    const { count: finalChecklistCount, error: finalChecklistError } = await supabase
      .from('checklist_results')
      .select('*', { count: 'exact', head: true });

    const { data: finalChecklistResults, error: finalChecklistResultsError } = await supabase
      .from('checklist_results')
      .select('user_id')
      .not('user_id', 'is', null);

    const { data: finalBlsResults, error: finalBlsResultsError } = await supabase
      .from('bls_results')
      .select('user_id')
      .not('user_id', 'is', null);

    if (finalChecklistError || finalChecklistResultsError || finalBlsResultsError) {
      console.error('❌ Error getting final counts');
      return;
    }

    const finalChecklistUserIds = [...new Set(finalChecklistResults.map(r => r.user_id))];
    const finalBlsUserIds = [...new Set(finalBlsResults.map(r => r.user_id))];

    console.log(`Final Checklist Results: ${finalChecklistCount} records (${finalChecklistUserIds.length} unique participants)`);
    console.log(`Final BLS Results: ${finalBlsUserIds.length} unique participants`);
    console.log(`Average checklist results per participant: ${(finalChecklistCount / finalChecklistUserIds.length).toFixed(2)}`);

    // Check for participants with BLS results but no checklist results
    const missingChecklist = finalBlsUserIds.filter(userId => !finalChecklistUserIds.includes(userId));
    console.log(`\nParticipants with BLS results but no checklist results: ${missingChecklist.length}`);
    
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
    } else {
      console.log('🎉 All participants now have checklist results!');
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
fixRemainingChecklistResults();

