// combineBLSResultsWorking.js
// Working script to combine quiz_session and checklist_result data into bls_results

const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function combineBLSResultsWorking() {
  try {
    console.log('🚀 Starting BLS Results Combination Process...\n');

    // Step 1: Get all quiz sessions (pre-test and post-test)
    console.log('1. Fetching quiz sessions data...');
    const quizSessions = await fetchQuizSessions();
    console.log(`Found ${quizSessions.length} quiz sessions`);

    // Step 2: Get all checklist results
    console.log('\n2. Fetching checklist results data...');
    const checklistResults = await fetchChecklistResults();
    console.log(`Found ${checklistResults.length} checklist results`);

    // Step 3: Group data by participant (user_id + participant_ic)
    console.log('\n3. Grouping data by participant...');
    const groupedData = groupDataByParticipant(quizSessions, checklistResults);
    console.log(`Grouped into ${Object.keys(groupedData).length} unique participants`);

    // Step 4: Create combined bls_result records
    console.log('\n4. Creating combined bls_results records...');
    const combinedResults = createCombinedResults(groupedData);
    console.log(`Created ${combinedResults.length} combined result records`);

    // Step 5: Insert/Update bls_results table
    console.log('\n5. Updating bls_results table...');
    await updateBLSResultsTable(combinedResults);

    console.log('\n✅ BLS Results combination completed successfully!');
    
    // Step 6: Display summary
    displaySummary(combinedResults);

  } catch (error) {
    console.error('❌ Error combining BLS results:', error);
    throw error;
  }
}

async function fetchQuizSessions() {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('status', 'submitted')
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching quiz sessions: ${error.message}`);
  }

  return data || [];
}

async function fetchChecklistResults() {
  const { data, error } = await supabase
    .from('checklist_results')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching checklist results: ${error.message}`);
  }

  return data || [];
}

function groupDataByParticipant(quizSessions, checklistResults) {
  const grouped = {};

  // Group quiz sessions by participant
  quizSessions.forEach(session => {
    const key = `${session.user_id}_${session.participant_ic || 'no_ic'}`;
    
    if (!grouped[key]) {
      grouped[key] = {
        user_id: session.user_id,
        participant_name: session.participant_name,
        participant_ic: session.participant_ic,
        quiz_sessions: [],
        checklist_results: []
      };
    }

    grouped[key].quiz_sessions.push(session);
  });

  // Group checklist results by participant
  checklistResults.forEach(result => {
    const key = `${result.user_id}_${result.participant_ic || 'no_ic'}`;
    
    if (!grouped[key]) {
      grouped[key] = {
        user_id: result.user_id,
        participant_name: result.participant_name,
        participant_ic: result.participant_ic,
        quiz_sessions: [],
        checklist_results: []
      };
    }

    grouped[key].checklist_results.push(result);
  });

  return grouped;
}

function createCombinedResults(groupedData) {
  const combinedResults = [];

  Object.values(groupedData).forEach(participant => {
    // Find pre-test and post-test sessions
    const preTestSession = participant.quiz_sessions.find(s => s.quiz_key === 'pretest');
    const postTestSession = participant.quiz_sessions.find(s => s.quiz_key === 'posttest');

    // Group checklist results by type
    const checklistByType = {};
    participant.checklist_results.forEach(result => {
      checklistByType[result.checklist_type] = result;
    });

    // Calculate checklist statistics
    const checklistTypes = ['one-man-cpr', 'two-man-cpr', 'adult-choking', 'infant-choking', 'infant-cpr'];
    let totalChecklistScore = 0;
    let totalChecklistItems = 0;
    let checklistPassCount = 0;

    checklistTypes.forEach(type => {
      const result = checklistByType[type];
      if (result) {
        totalChecklistScore += result.score || 0;
        totalChecklistItems += result.total_items || 0;
        if (result.status === 'PASS') checklistPassCount++;
      }
    });

    // Create combined result
    const combinedResult = {
      user_id: participant.user_id,
      pre_test_score: preTestSession?.score || 0,
      post_test_score: postTestSession?.score || 0,
      one_man_cpr_pass: checklistByType['one-man-cpr']?.status === 'PASS' || false,
      two_man_cpr_pass: checklistByType['two-man-cpr']?.status === 'PASS' || false,
      adult_choking_pass: checklistByType['adult-choking']?.status === 'PASS' || false,
      infant_choking_pass: checklistByType['infant-choking']?.status === 'PASS' || false,
      infant_cpr_pass: checklistByType['infant-cpr']?.status === 'PASS' || false,
      one_man_cpr_details: checklistByType['one-man-cpr']?.checklist_details || { performed: [], notPerformed: [] },
      two_man_cpr_details: checklistByType['two-man-cpr']?.checklist_details || { performed: [], notPerformed: [] },
      adult_choking_details: checklistByType['adult-choking']?.checklist_details || { performed: [], notPerformed: [] },
      infant_choking_details: checklistByType['infant-choking']?.checklist_details || { performed: [], notPerformed: [] },
      infant_cpr_details: checklistByType['infant-cpr']?.checklist_details || { performed: [], notPerformed: [] }
    };

    combinedResults.push(combinedResult);
  });

  return combinedResults;
}

async function updateBLSResultsTable(combinedResults) {
  // Insert new combined data in batches
  const batchSize = 50;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < combinedResults.length; i += batchSize) {
    const batch = combinedResults.slice(i, i + batchSize);
    
    try {
      const { data, error } = await supabase
        .from('bls_results')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error.message);
        errorCount += batch.length;
      } else {
        console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(combinedResults.length/batchSize)} (${batch.length} records)`);
        successCount += batch.length;
      }
    } catch (err) {
      console.error(`❌ Exception in batch ${Math.floor(i/batchSize) + 1}:`, err.message);
      errorCount += batch.length;
    }
  }

  console.log(`\n📊 Insert Summary: ${successCount} successful, ${errorCount} failed`);
}

function displaySummary(combinedResults) {
  console.log('\n📊 COMBINATION SUMMARY:');
  console.log('========================');
  console.log(`Total combined records: ${combinedResults.length}`);
  
  // Count participants with different data types
  const withPreTest = combinedResults.filter(r => r.pre_test_score > 0).length;
  const withPostTest = combinedResults.filter(r => r.post_test_score > 0).length;
  const withChecklists = combinedResults.filter(r => 
    r.one_man_cpr_pass || r.two_man_cpr_pass || r.adult_choking_pass || 
    r.infant_choking_pass || r.infant_cpr_pass
  ).length;
  const completeRecords = combinedResults.filter(r => 
    r.pre_test_score > 0 && r.post_test_score > 0 && 
    (r.one_man_cpr_pass || r.two_man_cpr_pass || r.adult_choking_pass || 
     r.infant_choking_pass || r.infant_cpr_pass)
  ).length;

  console.log(`Records with pre-test: ${withPreTest}`);
  console.log(`Records with post-test: ${withPostTest}`);
  console.log(`Records with checklists: ${withChecklists}`);
  console.log(`Complete records (all data): ${completeRecords}`);

  // Checklist statistics
  const checklistStats = {
    'one-man-cpr': combinedResults.filter(r => r.one_man_cpr_pass).length,
    'two-man-cpr': combinedResults.filter(r => r.two_man_cpr_pass).length,
    'adult-choking': combinedResults.filter(r => r.adult_choking_pass).length,
    'infant-choking': combinedResults.filter(r => r.infant_choking_pass).length,
    'infant-cpr': combinedResults.filter(r => r.infant_cpr_pass).length
  };

  console.log('\nChecklist Pass Rates:');
  Object.entries(checklistStats).forEach(([type, count]) => {
    const percentage = ((count / combinedResults.length) * 100).toFixed(1);
    console.log(`  ${type}: ${count}/${combinedResults.length} (${percentage}%)`);
  });

  // Score statistics
  const preTestScores = combinedResults.filter(r => r.pre_test_score > 0).map(r => r.pre_test_score);
  const postTestScores = combinedResults.filter(r => r.post_test_score > 0).map(r => r.post_test_score);

  if (preTestScores.length > 0) {
    const avgPreTest = (preTestScores.reduce((a, b) => a + b, 0) / preTestScores.length).toFixed(1);
    console.log(`\nAverage pre-test score: ${avgPreTest}/30`);
  }

  if (postTestScores.length > 0) {
    const avgPostTest = (postTestScores.reduce((a, b) => a + b, 0) / postTestScores.length).toFixed(1);
    console.log(`Average post-test score: ${avgPostTest}/30`);
  }
}

// Run the combination process
if (require.main === module) {
  combineBLSResultsWorking()
    .then(() => {
      console.log('\n🎉 BLS Results combination completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 BLS Results combination failed:', error);
      process.exit(1);
    });
}

module.exports = { combineBLSResultsWorking };

