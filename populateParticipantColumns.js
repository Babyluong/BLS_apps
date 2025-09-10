// populateParticipantColumns.js
// Populate participant_ic and participant_name columns in bls_results

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateParticipantColumns() {
  try {
    console.log('🔄 Populating participant_ic and participant_name columns...\n');

    // First, check if the columns exist
    console.log('1. Checking if columns exist...');
    const { data: sampleRecord, error: sampleError } = await supabase
      .from('bls_results')
      .select('participant_ic, participant_name')
      .limit(1);

    if (sampleError) {
      if (sampleError.message.includes('column "participant_ic" does not exist') || 
          sampleError.message.includes('column "participant_name" does not exist')) {
        console.log('❌ Columns do not exist yet. Please add them first:');
        console.log('\n📋 SQL Commands to run in Supabase Dashboard:');
        console.log('==============================================');
        console.log('ALTER TABLE bls_results ADD COLUMN participant_ic TEXT;');
        console.log('ALTER TABLE bls_results ADD COLUMN participant_name TEXT;');
        console.log('\nAfter adding these columns, run this script again.');
        return;
      } else {
        console.log('❌ Error checking columns:', sampleError.message);
        return;
      }
    }

    console.log('✅ Columns exist, proceeding with population...\n');

    // Get all bls_results records
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (blsError) {
      console.log('❌ Error fetching bls_results:', blsError.message);
      return;
    }

    console.log(`Found ${blsResults.length} bls_results records to update`);

    // Get all quiz sessions to find participant info
    const { data: quizSessions, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('user_id, participant_name, participant_ic')
      .eq('status', 'submitted');

    if (quizError) {
      console.log('❌ Error fetching quiz_sessions:', quizError.message);
      return;
    }

    // Get all checklist results to find participant info
    const { data: checklistResults, error: checklistError } = await supabase
      .from('checklist_results')
      .select('user_id, participant_name, participant_ic');

    if (checklistError) {
      console.log('❌ Error fetching checklist_results:', checklistError.message);
      return;
    }

    // Create lookup maps for participant info
    const participantInfo = {};
    
    // Add info from quiz sessions
    quizSessions.forEach(session => {
      if (session.user_id && !participantInfo[session.user_id]) {
        participantInfo[session.user_id] = {
          participant_name: session.participant_name,
          participant_ic: session.participant_ic
        };
      }
    });

    // Add info from checklist results (may have different names/ICs)
    checklistResults.forEach(result => {
      if (result.user_id) {
        if (!participantInfo[result.user_id]) {
          participantInfo[result.user_id] = {
            participant_name: result.participant_name,
            participant_ic: result.participant_ic
          };
        } else {
          // If we have conflicting info, prefer the one with more complete data
          if (result.participant_name && result.participant_ic) {
            participantInfo[result.user_id] = {
              participant_name: result.participant_name,
              participant_ic: result.participant_ic
            };
          }
        }
      }
    });

    console.log(`Found participant info for ${Object.keys(participantInfo).length} users`);

    // Update bls_results with participant info
    let updateCount = 0;
    let errorCount = 0;
    let missingInfoCount = 0;

    console.log('\n2. Updating bls_results records...');
    
    for (const blsResult of blsResults) {
      const info = participantInfo[blsResult.user_id];
      
      if (info) {
        const { error: updateError } = await supabase
          .from('bls_results')
          .update({
            participant_name: info.participant_name,
            participant_ic: info.participant_ic
          })
          .eq('id', blsResult.id);

        if (updateError) {
          console.log(`❌ Error updating ${blsResult.id}: ${updateError.message}`);
          errorCount++;
        } else {
          updateCount++;
          if (updateCount % 10 === 0) {
            console.log(`  Updated ${updateCount}/${blsResults.length} records...`);
          }
        }
      } else {
        console.log(`⚠️ No participant info found for user_id: ${blsResult.user_id}`);
        missingInfoCount++;
        errorCount++;
      }
    }

    console.log(`\n📊 Update Summary:`);
    console.log(`=================`);
    console.log(`- Records updated: ${updateCount}`);
    console.log(`- Records with errors: ${errorCount}`);
    console.log(`- Records missing participant info: ${missingInfoCount}`);
    console.log(`- Total records processed: ${blsResults.length}`);

    // Verify the updates
    console.log('\n3. Verifying updates...');
    const { data: updatedResults, error: updatedError } = await supabase
      .from('bls_results')
      .select('user_id, participant_name, participant_ic, pre_test_score, post_test_score')
      .order('created_at', { ascending: false });

    if (updatedError) {
      console.log('❌ Error verifying updates:', updatedError.message);
      return;
    }

    const recordsWithNames = updatedResults.filter(r => r.participant_name).length;
    const recordsWithICs = updatedResults.filter(r => r.participant_ic).length;
    const recordsWithBoth = updatedResults.filter(r => r.participant_name && r.participant_ic).length;

    console.log(`✅ Verification results:`);
    console.log(`- Total records: ${updatedResults.length}`);
    console.log(`- Records with names: ${recordsWithNames}`);
    console.log(`- Records with ICs: ${recordsWithICs}`);
    console.log(`- Records with both: ${recordsWithBoth}`);

    // Show sample of updated records
    console.log(`\n📋 Sample of updated records:`);
    updatedResults.slice(0, 5).forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.participant_name || 'N/A'} (${record.participant_ic || 'N/A'})`);
      console.log(`     User ID: ${record.user_id.substring(0, 8)}...`);
      console.log(`     Pre-test: ${record.pre_test_score || 'N/A'}, Post-test: ${record.post_test_score || 'N/A'}`);
    });

    // Check for any remaining records without participant info
    const recordsWithoutInfo = updatedResults.filter(r => !r.participant_name || !r.participant_ic);
    if (recordsWithoutInfo.length > 0) {
      console.log(`\n⚠️ Records still missing participant info (${recordsWithoutInfo.length}):`);
      recordsWithoutInfo.forEach(record => {
        console.log(`  - User ID: ${record.user_id}, Name: ${record.participant_name || 'N/A'}, IC: ${record.participant_ic || 'N/A'}`);
      });
    }

    console.log(`\n🎉 Participant column population completed!`);
    console.log(`Now you can easily spot irregularities by looking at participant names and ICs.`);

  } catch (error) {
    console.error('❌ Error populating participant columns:', error);
  }
}

populateParticipantColumns();

