// combineBLSResults.js
// Script to combine quiz_session and checklist_result data into bls_result table

const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function combineBLSResults() {
  try {
    console.log('🚀 Starting BLS Results Combination Process...\n');

    // Step 1: Update bls_result table schema to accommodate combined data
    console.log('1. Updating bls_result table schema...');
    await updateBLSResultSchema();

    // Step 2: Get all quiz sessions (pre-test and post-test)
    console.log('\n2. Fetching quiz sessions data...');
    const quizSessions = await fetchQuizSessions();
    console.log(`Found ${quizSessions.length} quiz sessions`);

    // Step 3: Get all checklist results
    console.log('\n3. Fetching checklist results data...');
    const checklistResults = await fetchChecklistResults();
    console.log(`Found ${checklistResults.length} checklist results`);

    // Step 4: Group data by participant (user_id + participant_ic)
    console.log('\n4. Grouping data by participant...');
    const groupedData = groupDataByParticipant(quizSessions, checklistResults);
    console.log(`Grouped into ${Object.keys(groupedData).length} unique participants`);

    // Step 5: Create combined bls_result records
    console.log('\n5. Creating combined bls_result records...');
    const combinedResults = createCombinedResults(groupedData);
    console.log(`Created ${combinedResults.length} combined result records`);

    // Step 6: Insert/Update bls_result table
    console.log('\n6. Updating bls_result table...');
    await updateBLSResultTable(combinedResults);

    console.log('\n✅ BLS Results combination completed successfully!');
    
    // Step 7: Display summary
    displaySummary(combinedResults);

  } catch (error) {
    console.error('❌ Error combining BLS results:', error);
    throw error;
  }
}

async function updateBLSResultSchema() {
  console.log('⚠️ Schema update requires manual execution in Supabase Dashboard');
  console.log('Please run the following SQL in your Supabase SQL Editor:');
  console.log(`
-- Update bls_result table to accommodate combined data
ALTER TABLE bls_result 
ADD COLUMN IF NOT EXISTS participant_name TEXT,
ADD COLUMN IF NOT EXISTS participant_ic TEXT,
ADD COLUMN IF NOT EXISTS pre_test_session_id UUID,
ADD COLUMN IF NOT EXISTS post_test_session_id UUID,
ADD COLUMN IF NOT EXISTS pre_test_percentage INTEGER,
ADD COLUMN IF NOT EXISTS post_test_percentage INTEGER,
ADD COLUMN IF NOT EXISTS pre_test_answers JSONB,
ADD COLUMN IF NOT EXISTS post_test_answers JSONB,
ADD COLUMN IF NOT EXISTS pre_test_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS post_test_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS checklist_results JSONB,
ADD COLUMN IF NOT EXISTS total_checklist_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_checklist_items INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS checklist_pass_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS checklist_total_count INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bls_result_participant_ic ON bls_result(participant_ic);
CREATE INDEX IF NOT EXISTS idx_bls_result_participant_name ON bls_result(participant_name);
CREATE INDEX IF NOT EXISTS idx_bls_result_pre_test_session ON bls_result(pre_test_session_id);
CREATE INDEX IF NOT EXISTS idx_bls_result_post_test_session ON bls_result(post_test_session_id);
  `);
  
  // For now, we'll skip the schema update and work with existing columns
  console.log('✅ Proceeding with existing schema...');
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
    const checklistResults = {};

    checklistTypes.forEach(type => {
      const result = checklistByType[type];
      if (result) {
        checklistResults[type] = {
          id: result.id,
          score: result.score,
          total_items: result.total_items,
          status: result.status,
          checklist_details: result.checklist_details,
          comments: result.comments,
          assessment_date: result.assessment_date,
          duration_seconds: result.duration_seconds
        };
        
        totalChecklistScore += result.score;
        totalChecklistItems += result.total_items;
        if (result.status === 'PASS') checklistPassCount++;
      } else {
        checklistResults[type] = null;
      }
    });

    // Create combined result
    const combinedResult = {
      user_id: participant.user_id,
      participant_name: participant.participant_name,
      participant_ic: participant.participant_ic,
      
      // Pre-test data
      pre_test_score: preTestSession?.score || 0,
      pre_test_percentage: preTestSession?.percentage || 0,
      pre_test_session_id: preTestSession?.id || null,
      pre_test_answers: preTestSession?.answers || null,
      pre_test_started_at: preTestSession?.started_at || null,
      
      // Post-test data
      post_test_score: postTestSession?.score || 0,
      post_test_percentage: postTestSession?.percentage || 0,
      post_test_session_id: postTestSession?.id || null,
      post_test_answers: postTestSession?.answers || null,
      post_test_started_at: postTestSession?.started_at || null,
      
      // Checklist data
      one_man_cpr_pass: checklistResults['one-man-cpr']?.status === 'PASS' || false,
      two_man_cpr_pass: checklistResults['two-man-cpr']?.status === 'PASS' || false,
      adult_choking_pass: checklistResults['adult-choking']?.status === 'PASS' || false,
      infant_choking_pass: checklistResults['infant-choking']?.status === 'PASS' || false,
      infant_cpr_pass: checklistResults['infant-cpr']?.status === 'PASS' || false,
      
      // Checklist details
      one_man_cpr_details: checklistResults['one-man-cpr']?.checklist_details || { performed: [], notPerformed: [] },
      two_man_cpr_details: checklistResults['two-man-cpr']?.checklist_details || { performed: [], notPerformed: [] },
      adult_choking_details: checklistResults['adult-choking']?.checklist_details || { performed: [], notPerformed: [] },
      infant_choking_details: checklistResults['infant-choking']?.checklist_details || { performed: [], notPerformed: [] },
      infant_cpr_details: checklistResults['infant-cpr']?.checklist_details || { performed: [], notPerformed: [] },
      
      // Combined checklist data
      checklist_results: checklistResults,
      total_checklist_score: totalChecklistScore,
      total_checklist_items: totalChecklistItems,
      checklist_pass_count: checklistPassCount,
      checklist_total_count: checklistTypes.length,
      
      // Metadata
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    combinedResults.push(combinedResult);
  });

  return combinedResults;
}

async function updateBLSResultTable(combinedResults) {
  // Clear existing data first (optional - you might want to keep existing data)
  console.log('Clearing existing bls_result data...');
  const { error: deleteError } = await supabase
    .from('bls_result')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

  if (deleteError) {
    console.warn('⚠️ Error clearing existing data:', deleteError.message);
  }

  // Insert new combined data in batches
  const batchSize = 100;
  for (let i = 0; i < combinedResults.length; i += batchSize) {
    const batch = combinedResults.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('bls_result')
      .insert(batch)
      .select();

    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error.message);
      throw error;
    }

    console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(combinedResults.length/batchSize)} (${batch.length} records)`);
  }
}

function displaySummary(combinedResults) {
  console.log('\n📊 COMBINATION SUMMARY:');
  console.log('========================');
  console.log(`Total combined records: ${combinedResults.length}`);
  
  // Count participants with different data types
  const withPreTest = combinedResults.filter(r => r.pre_test_session_id).length;
  const withPostTest = combinedResults.filter(r => r.post_test_session_id).length;
  const withChecklists = combinedResults.filter(r => r.checklist_pass_count > 0).length;
  const completeRecords = combinedResults.filter(r => 
    r.pre_test_session_id && r.post_test_session_id && r.checklist_pass_count > 0
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
  combineBLSResults()
    .then(() => {
      console.log('\n🎉 BLS Results combination completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 BLS Results combination failed:', error);
      process.exit(1);
    });
}

module.exports = { combineBLSResults };
