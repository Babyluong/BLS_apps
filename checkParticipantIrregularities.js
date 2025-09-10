// checkParticipantIrregularities.js
// Check for irregularities in participant data after adding columns

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkParticipantIrregularities() {
  try {
    console.log('🔍 Checking for participant irregularities...\n');

    // Get all bls_results records with participant info
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('user_id, participant_name, participant_ic, pre_test_score, post_test_score, one_man_cpr_pass, two_man_cpr_pass, adult_choking_pass, infant_choking_pass, infant_cpr_pass')
      .order('created_at', { ascending: false });

    if (blsError) {
      console.log('❌ Error fetching bls_results:', blsError.message);
      return;
    }

    console.log(`📊 Total records: ${blsResults.length}`);

    // Check for missing participant info
    const missingNames = blsResults.filter(r => !r.participant_name);
    const missingICs = blsResults.filter(r => !r.participant_ic);
    const missingBoth = blsResults.filter(r => !r.participant_name || !r.participant_ic);

    console.log(`\n📋 Missing Information:`);
    console.log(`- Records missing names: ${missingNames.length}`);
    console.log(`- Records missing ICs: ${missingICs.length}`);
    console.log(`- Records missing both: ${missingBoth.length}`);

    if (missingBoth.length > 0) {
      console.log(`\n⚠️ Records with missing participant info:`);
      missingBoth.forEach((record, index) => {
        console.log(`  ${index + 1}. User ID: ${record.user_id}`);
        console.log(`     Name: ${record.participant_name || 'MISSING'}`);
        console.log(`     IC: ${record.participant_ic || 'MISSING'}`);
      });
    }

    // Check for duplicate ICs
    const icGroups = {};
    blsResults.forEach(record => {
      if (record.participant_ic) {
        if (!icGroups[record.participant_ic]) {
          icGroups[record.participant_ic] = [];
        }
        icGroups[record.participant_ic].push(record);
      }
    });

    const duplicateICs = Object.entries(icGroups).filter(([ic, records]) => records.length > 1);
    
    console.log(`\n🆔 Duplicate ICs:`);
    console.log(`- Unique ICs: ${Object.keys(icGroups).length}`);
    console.log(`- Duplicate ICs: ${duplicateICs.length}`);

    if (duplicateICs.length > 0) {
      console.log(`\n⚠️ Duplicate ICs found:`);
      duplicateICs.forEach(([ic, records]) => {
        console.log(`\nIC: ${ic} (${records.length} records)`);
        records.forEach((record, index) => {
          console.log(`  ${index + 1}. User: ${record.user_id.substring(0, 8)}...`);
          console.log(`     Name: ${record.participant_name || 'N/A'}`);
          console.log(`     Pre-test: ${record.pre_test_score || 'N/A'}, Post-test: ${record.post_test_score || 'N/A'}`);
        });
      });
    }

    // Check for duplicate names
    const nameGroups = {};
    blsResults.forEach(record => {
      if (record.participant_name) {
        if (!nameGroups[record.participant_name]) {
          nameGroups[record.participant_name] = [];
        }
        nameGroups[record.participant_name].push(record);
      }
    });

    const duplicateNames = Object.entries(nameGroups).filter(([name, records]) => records.length > 1);
    
    console.log(`\n👤 Duplicate Names:`);
    console.log(`- Unique names: ${Object.keys(nameGroups).length}`);
    console.log(`- Duplicate names: ${duplicateNames.length}`);

    if (duplicateNames.length > 0) {
      console.log(`\n⚠️ Duplicate names found:`);
      duplicateNames.forEach(([name, records]) => {
        console.log(`\nName: ${name} (${records.length} records)`);
        records.forEach((record, index) => {
          console.log(`  ${index + 1}. User: ${record.user_id.substring(0, 8)}...`);
          console.log(`     IC: ${record.participant_ic || 'N/A'}`);
          console.log(`     Pre-test: ${record.pre_test_score || 'N/A'}, Post-test: ${record.post_test_score || 'N/A'}`);
        });
      });
    }

    // Check for suspicious patterns
    console.log(`\n🔍 Suspicious Patterns:`);
    
    // Check for users with same name but different ICs
    const nameToICs = {};
    blsResults.forEach(record => {
      if (record.participant_name && record.participant_ic) {
        if (!nameToICs[record.participant_name]) {
          nameToICs[record.participant_name] = new Set();
        }
        nameToICs[record.participant_name].add(record.participant_ic);
      }
    });

    const namesWithMultipleICs = Object.entries(nameToICs).filter(([name, ics]) => ics.size > 1);
    
    if (namesWithMultipleICs.length > 0) {
      console.log(`\n⚠️ Names with multiple ICs:`);
      namesWithMultipleICs.forEach(([name, ics]) => {
        console.log(`  - ${name}: ${Array.from(ics).join(', ')}`);
      });
    }

    // Check for users with same IC but different names
    const icToNames = {};
    blsResults.forEach(record => {
      if (record.participant_name && record.participant_ic) {
        if (!icToNames[record.participant_ic]) {
          icToNames[record.participant_ic] = new Set();
        }
        icToNames[record.participant_ic].add(record.participant_name);
      }
    });

    const icsWithMultipleNames = Object.entries(icToNames).filter(([ic, names]) => names.size > 1);
    
    if (icsWithMultipleNames.length > 0) {
      console.log(`\n⚠️ ICs with multiple names:`);
      icsWithMultipleNames.forEach(([ic, names]) => {
        console.log(`  - ${ic}: ${Array.from(names).join(', ')}`);
      });
    }

    // Summary
    console.log(`\n📊 SUMMARY:`);
    console.log(`===========`);
    console.log(`Total records: ${blsResults.length}`);
    console.log(`Records with complete info: ${blsResults.length - missingBoth.length}`);
    console.log(`Duplicate ICs: ${duplicateICs.length}`);
    console.log(`Duplicate names: ${duplicateNames.length}`);
    console.log(`Names with multiple ICs: ${namesWithMultipleICs.length}`);
    console.log(`ICs with multiple names: ${icsWithMultipleNames.length}`);

    if (duplicateICs.length === 0 && duplicateNames.length === 0 && namesWithMultipleICs.length === 0 && icsWithMultipleNames.length === 0) {
      console.log(`\n✅ No irregularities found! All participant data looks clean.`);
    } else {
      console.log(`\n⚠️ Found some irregularities that may need attention.`);
    }

  } catch (error) {
    console.error('❌ Error checking irregularities:', error);
  }
}

checkParticipantIrregularities();

