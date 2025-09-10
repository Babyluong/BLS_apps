// scripts/generateDataOnly.cjs
// Generate data for existing users only

const https = require('https');

// Supabase configuration
const SUPABASE_URL = 'https://ymajroaavaptafmoqciq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

// Participant data from your uploaded image
const participants = [
  { name: "NORLINA BINTI ALI", ic: "840901136178", preTest: 20, postTest: 20, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "AMRI AMIT", ic: "940120126733", preTest: 29, postTest: 29, oneManCpr: "PASS", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "GRACE RURAN NGILO", ic: "850315126789", preTest: 14, postTest: 22, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "NOR BAIZURAH BINTI MASLIM", ic: "920408126456", preTest: 18, postTest: 25, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "MANSUR BIN MURNI", ic: "870512126123", preTest: 16, postTest: 24, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "MARZUKI RAJANG", ic: "890623126789", preTest: 22, postTest: 28, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "SA'DI BIN USOP", ic: "910715126234", preTest: 15, postTest: 14, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "RAJAMI BIN ABDUL HASHIM", ic: "880901126567", preTest: 10, postTest: 19, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "FIZRA IVY WAS", ic: "930203126890", preTest: 25, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "NURIZANIE BINTI SANEH", ic: "860417126123", preTest: 19, postTest: 26, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "NURMASLIANA BINTI ISMAIL", ic: "900528126456", preTest: 21, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "CHRISTINA PADIN", ic: "850712126789", preTest: 13, postTest: 23, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" }
];

// Helper function to make HTTP requests
function makeRequest(url, options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ data: result, error: null });
        } catch (e) {
          resolve({ data: null, error: e });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Generate random answers for quiz questions
function generateRandomAnswers(questionCount, correctAnswers = 0.7) {
  const answers = {};
  const correctCount = Math.floor(questionCount * correctAnswers);
  
  for (let i = 1; i <= questionCount; i++) {
    const isCorrect = i <= correctCount;
    if (isCorrect) {
      answers[`malay-${i}`] = 'A';
    } else {
      const options = ['A', 'B', 'C', 'D'];
      answers[`malay-${i}`] = options[Math.floor(Math.random() * options.length)];
    }
  }
  
  return answers;
}

// Generate checklist details
function generateChecklistDetails(checklistType, isPassed) {
  const baseItems = {
    'one-man-cpr': ['danger_ppe', 'response_shoulder_tap', 'response_shout', 'airway_head_tilt', 'breathing_determine', 'breathing_compression_begin', 'circulation_location', 'circulation_rate', 'circulation_depth', 'circulation_recoil', 'circulation_minimize_interruption', 'circulation_ratio', 'circulation_ventilation_time', 'defib_switch_on', 'defib_attach_pads', 'defib_clear_analysis', 'defib_clear_shock', 'defib_push_shock', 'defib_resume_cpr', 'defib_no_shock_continue'],
    'two-man-cpr': ['danger_ppe_1st', 'response_shoulder_tap_1st', 'response_shout_1st', 'airway_head_tilt_1st', 'breathing_determine_1st', 'breathing_compression_begin_1st', 'circulation_location_1st', 'circulation_rate_1st', 'circulation_depth_1st', 'circulation_recoil_1st', 'circulation_minimize_interruption_1st', 'circulation_ratio_1st', 'circulation_ventilation_time_1st', 'defib_arrives_turns_on', 'defib_attach_pads_while_compression', 'defib_clear_analysis_switch_roles', 'defib_clear_shock'],
    'adult-choking': ['assess_ask_choking', 'assess_mild_effective_cough', 'assess_severe_ineffective_cough', 'mild_encourage_cough', 'severe_5_back_blows', 'severe_lean_victim_forwards', 'severe_blows_between_shoulder_blades', 'severe_5_abdominal_thrusts', 'severe_stand_behind_victim', 'severe_arms_around_upper_abdomen', 'severe_clench_fist_between_navel_ribcage', 'severe_grasp_fist_pull_sharply', 'severe_continue_alternating', 'unconscious_start_cpr'],
    'infant-choking': ['assess_mild_loud_cough', 'assess_mild_fully_responsive', 'assess_mild_coughing_effectively', 'assess_severe_cyanosis', 'assess_severe_ineffective_cough', 'mild_encourage_cough_monitor', 'severe_ask_for_help', 'severe_perform_5_back_blows', 'severe_back_blows_support_infant', 'severe_perform_5_chest_thrusts', 'severe_chest_thrust_turn_supine', 'unconscious_start_cpr'],
    'infant-cpr': ['danger_ppe', 'response_tap_soles', 'response_shout_call_infant', 'airway_head_tilt_chin_lift', 'breathing_look_normal_breathing', 'breathing_5_initial_rescue_breaths', 'breathing_duration_1_second', 'circulation_assess_circulation', 'circulation_brachial_pulse_10_seconds', 'circulation_start_compression_no_signs', 'circulation_one_rescuer_2_fingers', 'circulation_site_lower_half_sternum', 'circulation_depth_1_3_chest_4cm', 'circulation_rate_100_120_per_min', 'circulation_ratio_15_2']
  };

  const items = baseItems[checklistType] || [];
  const details = {};
  
  if (isPassed) {
    const performedCount = Math.floor(items.length * (0.8 + Math.random() * 0.2));
    const performedItems = items.slice(0, performedCount);
    const notPerformedItems = items.slice(performedCount);
    
    performedItems.forEach(item => details[item] = true);
    notPerformedItems.forEach(item => details[item] = false);
  } else {
    const performedCount = Math.floor(items.length * Math.random() * 0.6);
    const performedItems = items.slice(0, performedCount);
    const notPerformedItems = items.slice(performedCount);
    
    performedItems.forEach(item => details[item] = true);
    notPerformedItems.forEach(item => details[item] = false);
  }
  
  return details;
}

// Get existing users from the database
async function getExistingUsers() {
  console.log('Fetching existing users...');
  
  const { data: profiles, error } = await makeRequest(`${SUPABASE_URL}/rest/v1/profiles?select=id,full_name,ic`, {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  
  console.log(`Found ${profiles.length} existing users`);
  return profiles;
}

// Generate quiz sessions for existing users
async function generateQuizSessions(existingUsers) {
  console.log('Generating quiz sessions...');
  
  for (const participant of participants) {
    try {
      // Find matching user by IC
      const user = existingUsers.find(u => u.ic === participant.ic);
      
      if (!user) {
        console.log(`No existing user found for ${participant.name} (IC: ${participant.ic})`);
        continue;
      }
      
      console.log(`Processing ${participant.name} (User ID: ${user.id})`);
      
      // Generate pre-test session
      if (participant.preTest !== null) {
        const preTestAnswers = generateRandomAnswers(30, participant.preTest / 30);
        const { error } = await makeRequest(`${SUPABASE_URL}/rest/v1/quiz_sessions`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          }
        }, {
          user_id: user.id,
          quiz_key: 'pretest',
          status: 'submitted',
          score: participant.preTest,
          total_questions: 30,
          percentage: Math.round((participant.preTest / 30) * 100),
          answers: preTestAnswers,
          participant_name: participant.name,
          participant_ic: participant.ic,
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        if (error) {
          console.error(`Error creating pre-test for ${participant.name}:`, error);
        } else {
          console.log(`Created pre-test for ${participant.name} (${participant.preTest}/30)`);
        }
      }
      
      // Generate post-test session
      if (participant.postTest !== null) {
        const postTestAnswers = generateRandomAnswers(30, participant.postTest / 30);
        postTestAnswers._selected_set = 'SET_A';
        
        const { error } = await makeRequest(`${SUPABASE_URL}/rest/v1/quiz_sessions`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          }
        }, {
          user_id: user.id,
          quiz_key: 'posttest',
          status: 'submitted',
          score: participant.postTest,
          total_questions: 30,
          percentage: Math.round((participant.postTest / 30) * 100),
          answers: postTestAnswers,
          participant_name: participant.name,
          participant_ic: participant.ic,
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        if (error) {
          console.error(`Error creating post-test for ${participant.name}:`, error);
        } else {
          console.log(`Created post-test for ${participant.name} (${participant.postTest}/30)`);
        }
      }
    } catch (error) {
      console.error(`Error processing ${participant.name}:`, error);
    }
  }
}

// Generate checklist results for existing users
async function generateChecklistResults(existingUsers) {
  console.log('Generating checklist results...');
  
  const checklistTypes = ['one-man-cpr', 'two-man-cpr', 'adult-choking', 'infant-choking', 'infant-cpr'];
  
  for (const participant of participants) {
    try {
      // Find matching user by IC
      const user = existingUsers.find(u => u.ic === participant.ic);
      
      if (!user) {
        console.log(`No existing user found for ${participant.name} (IC: ${participant.ic})`);
        continue;
      }
      
      // Generate checklist results for each type
      for (const checklistType of checklistTypes) {
        const isPassed = participant[checklistType.replace('-', '')] === 'PASS';
        const details = generateChecklistDetails(checklistType, isPassed);
        const totalItems = Object.keys(details).length;
        const score = Object.values(details).filter(v => v === true).length;
        
        const { error } = await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          }
        }, {
          user_id: user.id,
          participant_name: participant.name,
          participant_ic: participant.ic,
          checklist_type: checklistType,
          score: score,
          total_items: totalItems,
          status: isPassed ? 'PASS' : 'FAIL',
          checklist_details: details,
          comments: isPassed ? 'Good performance' : 'Needs improvement',
          duration_seconds: Math.floor(Math.random() * 300) + 60,
          assessment_date: new Date().toISOString()
        });
        
        if (error) {
          console.error(`Error creating ${checklistType} for ${participant.name}:`, error);
        } else {
          console.log(`Created ${checklistType} for ${participant.name} (${isPassed ? 'PASS' : 'FAIL'})`);
        }
      }
    } catch (error) {
      console.error(`Error processing ${participant.name}:`, error);
    }
  }
}

// Main function
async function generateAllResults() {
  try {
    console.log('Starting data generation for existing users...');
    
    // Get existing users
    const existingUsers = await getExistingUsers();
    
    if (existingUsers.length === 0) {
      console.log('No existing users found. Please create users first through the app.');
      return;
    }
    
    // Generate quiz sessions
    await generateQuizSessions(existingUsers);
    
    // Generate checklist results
    await generateChecklistResults(existingUsers);
    
    console.log('Data generation completed!');
  } catch (error) {
    console.error('Error generating results:', error);
  }
}

// Run the script
generateAllResults();
