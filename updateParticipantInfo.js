// updateParticipantInfo.js
// Update bls_results with participant_ic and participant_name from original data

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateParticipantInfo() {
  try {
    console.log('🔄 Updating participant info in bls_results...\n');

    // Get all bls_results records
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (blsError) {
      console.log('❌ Error fetching bls_results:', blsError.message);
      return;
    }

    console.log(`Found ${blsResults.length} bls_results records`);

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
        }
      } else {
        console.log(`⚠️ No participant info found for user_id: ${blsResult.user_id}`);
        errorCount++;
      }
    }

    console.log(`\n📊 Update Summary:`);
    console.log(`- Records updated: ${updateCount}`);
    console.log(`- Records with errors: ${errorCount}`);

    // Now let's investigate the 57 vs 56 participant discrepancy
    console.log('\n🔍 Investigating participant count discrepancy...');
    
    // Get unique participants from bls_results
    const { data: updatedResults, error: updatedError } = await supabase
      .from('bls_results')
      .select('user_id, participant_name, participant_ic')
      .order('created_at', { ascending: false });

    if (updatedError) {
      console.log('❌ Error fetching updated results:', updatedError.message);
      return;
    }

    console.log(`\n📊 Current bls_results analysis:`);
    console.log(`Total records: ${updatedResults.length}`);
    
    // Group by participant_ic to find duplicates
    const icGroups = {};
    updatedResults.forEach(result => {
      const ic = result.participant_ic || 'NO_IC';
      if (!icGroups[ic]) {
        icGroups[ic] = [];
      }
      icGroups[ic].push(result);
    });

    const duplicateICs = Object.entries(icGroups).filter(([ic, records]) => records.length > 1);
    
    console.log(`Unique ICs: ${Object.keys(icGroups).length}`);
    console.log(`Duplicate ICs: ${duplicateICs.length}`);

    if (duplicateICs.length > 0) {
      console.log('\n🔍 Duplicate ICs found:');
      duplicateICs.forEach(([ic, records]) => {
        console.log(`\nIC: ${ic} (${records.length} records)`);
        records.forEach((record, index) => {
          console.log(`  Record ${index + 1}:`);
          console.log(`    User ID: ${record.user_id}`);
          console.log(`    Name: ${record.participant_name || 'N/A'}`);
          console.log(`    IC: ${record.participant_ic || 'N/A'}`);
        });
      });
    }

    // Check for records with missing IC
    const missingIC = updatedResults.filter(r => !r.participant_ic);
    if (missingIC.length > 0) {
      console.log(`\n⚠️ Records with missing IC: ${missingIC.length}`);
      missingIC.forEach(record => {
        console.log(`  User ID: ${record.user_id}, Name: ${record.participant_name || 'N/A'}`);
      });
    }

    // Get unique participants from original tables for comparison
    const uniqueQuizUsers = new Set(quizSessions.map(s => s.user_id));
    const uniqueChecklistUsers = new Set(checklistResults.map(r => r.user_id));
    const allUniqueUsers = new Set([...uniqueQuizUsers, ...uniqueChecklistUsers]);

    console.log(`\n📊 Original table comparison:`);
    console.log(`Unique users in quiz_sessions: ${uniqueQuizUsers.size}`);
    console.log(`Unique users in checklist_results: ${uniqueChecklistUsers.size}`);
    console.log(`Combined unique users: ${allUniqueUsers.size}`);
    console.log(`Records in bls_results: ${updatedResults.length}`);
    console.log(`Expected records: ${allUniqueUsers.size}`);
    console.log(`Extra records: ${updatedResults.length - allUniqueUsers.size}`);

  } catch (error) {
    console.error('❌ Error updating participant info:', error);
  }
}

updateParticipantInfo();

