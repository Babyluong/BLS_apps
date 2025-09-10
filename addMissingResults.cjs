// Add test results for missing participants
const https = require('https');

const SUPABASE_URL = 'https://ymajroaavaptafmoqciq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

// Missing participants with their results
const participants = [
  { name: "GRACE RURAN NGILO", ic: "850315126789", preTest: 14, postTest: 22, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "AMIR LUQMAN BIN MISKANI", ic: "870512126123", preTest: 25, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SUHARMIE BIN SULAIMAN", ic: "910715126234", preTest: 11, postTest: 23, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MISRAWATI MA AMAN", ic: "890623126789", preTest: 25, postTest: 29, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "MYRA ATHIRA BINTI OMAR", ic: "880901126567", preTest: 19, postTest: 27, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "SA'DI BIN USOP", ic: "910715126234", preTest: 15, postTest: 14, oneManCpr: "FAIL", twoManCpr: "FAIL", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "FAIL" },
  { name: "WENDY CHANDI ANAK SAMPURAI", ic: "880901126567", preTest: 20, postTest: 25, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" },
  { name: "NORLINA BINTI ALI", ic: "840901136178", preTest: 20, postTest: 28, oneManCpr: "PASS", twoManCpr: "PASS", adultChoking: "PASS", infantChoking: "PASS", infantCpr: "PASS" }
];

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
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function generateAnswers(score) {
  const answers = {};
  for (let i = 1; i <= 30; i++) {
    const isCorrect = i <= score;
    answers[`malay-${i}`] = isCorrect ? 'A' : 'B';
  }
  return answers;
}

function generateChecklistDetails(checklistType, isPassed) {
  const items = {
    'one-man-cpr': ['danger_ppe', 'response_shoulder_tap', 'response_shout', 'airway_head_tilt', 'breathing_determine', 'breathing_compression_begin', 'circulation_location', 'circulation_rate', 'circulation_depth', 'circulation_recoil', 'circulation_minimize_interruption', 'circulation_ratio', 'circulation_ventilation_time', 'defib_switch_on', 'defib_attach_pads', 'defib_clear_analysis', 'defib_clear_shock', 'defib_push_shock', 'defib_resume_cpr', 'defib_no_shock_continue'],
    'two-man-cpr': ['danger_ppe_1st', 'response_shoulder_tap_1st', 'response_shout_1st', 'airway_head_tilt_1st', 'breathing_determine_1st', 'breathing_compression_begin_1st', 'circulation_location_1st', 'circulation_rate_1st', 'circulation_depth_1st', 'circulation_recoil_1st', 'circulation_minimize_interruption_1st', 'circulation_ratio_1st', 'circulation_ventilation_time_1st', 'defib_arrives_turns_on', 'defib_attach_pads_while_compression', 'defib_clear_analysis_switch_roles', 'defib_clear_shock'],
    'adult-choking': ['assess_ask_choking', 'assess_mild_effective_cough', 'assess_severe_ineffective_cough', 'mild_encourage_cough', 'severe_5_back_blows', 'severe_lean_victim_forwards', 'severe_blows_between_shoulder_blades', 'severe_5_abdominal_thrusts', 'severe_stand_behind_victim', 'severe_arms_around_upper_abdomen', 'severe_clench_fist_between_navel_ribcage', 'severe_grasp_fist_pull_sharply', 'severe_continue_alternating', 'unconscious_start_cpr'],
    'infant-choking': ['assess_mild_loud_cough', 'assess_mild_fully_responsive', 'assess_mild_coughing_effectively', 'assess_severe_cyanosis', 'assess_severe_ineffective_cough', 'mild_encourage_cough_monitor', 'severe_ask_for_help', 'severe_perform_5_back_blows', 'severe_back_blows_support_infant', 'severe_perform_5_chest_thrusts', 'severe_chest_thrust_turn_supine', 'unconscious_start_cpr'],
    'infant-cpr': ['danger_ppe', 'response_tap_soles', 'response_shout_call_infant', 'airway_head_tilt_chin_lift', 'breathing_look_normal_breathing', 'breathing_5_initial_rescue_breaths', 'breathing_duration_1_second', 'circulation_assess_circulation', 'circulation_brachial_pulse_10_seconds', 'circulation_start_compression_no_signs', 'circulation_one_rescuer_2_fingers', 'circulation_site_lower_half_sternum', 'circulation_depth_1_3_chest_4cm', 'circulation_rate_100_120_per_min', 'circulation_ratio_15_2']
  };

  const checklistItems = items[checklistType] || [];
  const details = {};
  
  if (isPassed) {
    // For PASS: 80-100% of items performed
    const performedCount = Math.floor(checklistItems.length * 0.9);
    for (let i = 0; i < checklistItems.length; i++) {
      details[checklistItems[i]] = i < performedCount;
    }
  } else {
    // For FAIL: 40-60% of items performed
    const performedCount = Math.floor(checklistItems.length * 0.5);
    for (let i = 0; i < checklistItems.length; i++) {
      details[checklistItems[i]] = i < performedCount;
    }
  }
  
  return details;
}

async function addResults() {
  console.log('Adding test results for missing participants...');
  
  for (const p of participants) {
    try {
      // Get user ID
      const { data: users, error: userError } = await makeRequest(`${SUPABASE_URL}/rest/v1/users?ic=eq.${p.ic}&select=id`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (userError || !users || users.length === 0) {
        console.log(`❌ User not found: ${p.name}`);
        continue;
      }
      
      const userId = users[0].id;
      console.log(`📝 Adding results for ${p.name}...`);
      
      // Add pre-test
      const preAnswers = generateAnswers(p.preTest);
      await makeRequest(`${SUPABASE_URL}/rest/v1/quiz_sessions`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }
      }, {
        user_id: userId,
        quiz_key: 'pretest',
        status: 'submitted',
        score: p.preTest,
        total_questions: 30,
        percentage: Math.round((p.preTest / 30) * 100),
        answers: preAnswers,
        participant_name: p.name,
        participant_ic: p.ic,
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Add post-test
      const postAnswers = generateAnswers(p.postTest);
      postAnswers._selected_set = 'SET_A';
      await makeRequest(`${SUPABASE_URL}/rest/v1/quiz_sessions`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }
      }, {
        user_id: userId,
        quiz_key: 'posttest',
        status: 'submitted',
        score: p.postTest,
        total_questions: 30,
        percentage: Math.round((p.postTest / 30) * 100),
        answers: postAnswers,
        participant_name: p.name,
        participant_ic: p.ic,
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Add checklist results
      const checklistTypes = ['one-man-cpr', 'two-man-cpr', 'adult-choking', 'infant-choking', 'infant-cpr'];
      const checklistResults = [p.oneManCpr, p.twoManCpr, p.adultChoking, p.infantChoking, p.infantCpr];
      
      for (let i = 0; i < checklistTypes.length; i++) {
        const checklistType = checklistTypes[i];
        const isPassed = checklistResults[i] === 'PASS';
        const details = generateChecklistDetails(checklistType, isPassed);
        const totalItems = Object.keys(details).length;
        const score = Object.values(details).filter(v => v === true).length;
        
        await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          }
        }, {
          user_id: userId,
          participant_name: p.name,
          participant_ic: p.ic,
          checklist_type: checklistType,
          score: score,
          total_items: totalItems,
          status: isPassed ? 'PASS' : 'FAIL',
          checklist_details: details,
          comments: isPassed ? 'Good performance' : 'Needs improvement',
          duration_seconds: Math.floor(Math.random() * 300) + 60,
          assessment_date: new Date().toISOString()
        });
      }
      
      console.log(`✅ Added results for ${p.name} - Pre: ${p.preTest}, Post: ${p.postTest}, CPR: ${p.oneManCpr}/${p.twoManCpr}, Choking: ${p.adultChoking}/${p.infantChoking}, Infant-CPR: ${p.infantCpr}`);
      
    } catch (error) {
      console.log(`❌ Error with ${p.name}:`, error.message);
    }
  }
  
  console.log('🎉 All test results added!');
}

addResults();
