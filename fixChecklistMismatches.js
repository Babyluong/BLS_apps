// fixChecklistMismatches.js - Fix checklist pass/fail mismatches between checklist_results and bls_results
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixChecklistMismatches() {
  console.log('🔧 Fixing checklist pass/fail mismatches between checklist_results and bls_results...\n');

  try {
    // Get all checklist results
    const { data: checklistResults, error: checklistError } = await supabase
      .from('checklist_results')
      .select('*')
      .order('participant_ic');

    if (checklistError) {
      console.error('❌ Error fetching checklist_results:', checklistError);
      return;
    }

    // Get all bls results
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('*')
      .order('participant_ic');

    if (blsError) {
      console.error('❌ Error fetching bls_results:', blsError);
      return;
    }

    console.log(`📊 Found ${checklistResults.length} checklist records and ${blsResults.length} bls records\n`);

    // Group checklist results by participant IC
    const checklistMap = new Map();
    checklistResults.forEach(checklist => {
      if (!checklistMap.has(checklist.participant_ic)) {
        checklistMap.set(checklist.participant_ic, []);
      }
      checklistMap.get(checklist.participant_ic).push(checklist);
    });

    // Check each bls result for mismatches
    let fixedCount = 0;
    const participantsToFix = [];

    for (const bls of blsResults) {
      const checklists = checklistMap.get(bls.participant_ic) || [];
      const checklistTypes = ['one-man-cpr', 'two-man-cpr', 'adult-choking', 'infant-choking', 'infant-cpr'];
      const blsFields = ['one_man_cpr_pass', 'two_man_cpr_pass', 'adult_choking_pass', 'infant_choking_pass', 'infant_cpr_pass'];

      let hasMismatch = false;
      const updates = {};

      for (let i = 0; i < checklistTypes.length; i++) {
        const checklistType = checklistTypes[i];
        const blsField = blsFields[i];
        const checklist = checklists.find(c => c.checklist_type === checklistType);

        if (checklist) {
          const checklistPass = checklist.status === 'PASS';
          const blsPass = bls[blsField];

          if (checklistPass !== blsPass) {
            console.log(`❌ ${bls.participant_name} (${bls.participant_ic}): ${checklistType} mismatch`);
            console.log(`   checklist_results: ${checklistPass ? 'PASS' : 'FAIL'} vs bls_results: ${blsPass ? 'PASS' : 'FAIL'}`);
            console.log(`   Updating bls_results to match checklist_results: ${checklistPass ? 'PASS' : 'FAIL'}`);
            
            updates[blsField] = checklistPass;
            hasMismatch = true;
          }
        }
      }

      if (hasMismatch) {
        participantsToFix.push({
          ic: bls.participant_ic,
          name: bls.participant_name,
          updates: updates
        });
      }
    }

    console.log(`\n📋 Found ${participantsToFix.length} participants with checklist mismatches\n`);

    // Fix the mismatches
    for (const participant of participantsToFix) {
      console.log(`🔧 Fixing ${participant.name} (${participant.ic})...`);
      
      const { error: updateError } = await supabase
        .from('bls_results')
        .update({
          ...participant.updates,
          updated_at: new Date().toISOString()
        })
        .eq('participant_ic', participant.ic);

      if (updateError) {
        console.error(`❌ Error updating ${participant.name}:`, updateError);
      } else {
        console.log(`✅ Successfully updated ${participant.name}`);
        fixedCount++;
      }
    }

    console.log(`\n🎉 Fixed ${fixedCount} participants with checklist mismatches`);

    // Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    for (const participant of participantsToFix) {
      const { data: verifyData, error: verifyError } = await supabase
        .from('bls_results')
        .select('*')
        .eq('participant_ic', participant.ic);

      if (verifyError) {
        console.error(`❌ Error verifying ${participant.name}:`, verifyError);
      } else if (verifyData && verifyData.length > 0) {
        const bls = verifyData[0];
        console.log(`✅ ${participant.name} (${participant.ic}):`);
        console.log(`   One-man CPR: ${bls.one_man_cpr_pass ? 'PASS' : 'FAIL'}`);
        console.log(`   Two-man CPR: ${bls.two_man_cpr_pass ? 'PASS' : 'FAIL'}`);
        console.log(`   Adult choking: ${bls.adult_choking_pass ? 'PASS' : 'FAIL'}`);
        console.log(`   Infant choking: ${bls.infant_choking_pass ? 'PASS' : 'FAIL'}`);
        console.log(`   Infant CPR: ${bls.infant_cpr_pass ? 'PASS' : 'FAIL'}`);
      }
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
fixChecklistMismatches();

