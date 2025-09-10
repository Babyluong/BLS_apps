const https = require('https');

// Supabase configuration
const SUPABASE_URL = 'https://ymajroaavaptafmoqciq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

// Helper function to make HTTP requests
function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (body.trim() === '') {
          resolve({ data: null, error: null, status: res.statusCode, rawBody: body });
          return;
        }
        try {
          const data = JSON.parse(body);
          resolve({ data, error: null, status: res.statusCode, rawBody: body });
        } catch (e) {
          resolve({ data: null, error: e, status: res.statusCode, rawBody: body });
        }
      });
    });
    req.on('error', (err) => {
      reject(err);
    });
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Get existing users from profiles table
async function getExistingUsers() {
  console.log('🔍 Fetching existing users from profiles table...');
  
  const options = {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(`${SUPABASE_URL}/rest/v1/profiles?select=id,full_name,ic`, options);
    
    if (response.error) {
      console.error('❌ Error fetching users:', response.error);
      return [];
    }

    console.log(`✅ Found ${response.data.length} users in profiles table`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return [];
  }
}

// Get all quiz sessions
async function getQuizSessions() {
  console.log('🔍 Fetching quiz sessions...');
  
  const options = {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(`${SUPABASE_URL}/rest/v1/quiz_sessions?select=*&status=eq.submitted`, options);
    
    if (response.error) {
      console.error('❌ Error fetching quiz sessions:', response.error);
      return [];
    }

    if (!response.data || !Array.isArray(response.data)) {
      console.error('❌ Invalid quiz sessions data:', response.data);
      return [];
    }

    console.log(`✅ Found ${response.data.length} quiz sessions`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching quiz sessions:', error);
    return [];
  }
}

// Get all checklist results
async function getChecklistResults() {
  console.log('🔍 Fetching checklist results...');
  
  const options = {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(`${SUPABASE_URL}/rest/v1/checklist_results?select=*`, options);
    
    if (response.error) {
      console.error('❌ Error fetching checklist results:', response.error);
      return [];
    }

    if (!response.data || !Array.isArray(response.data)) {
      console.error('❌ Invalid checklist results data:', response.data);
      return [];
    }

    console.log(`✅ Found ${response.data.length} checklist results`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching checklist results:', error);
    return [];
  }
}

// Name mappings for known variations
const nameMappings = {
  "AHMAD ZAKI ISAMUDDIN BIN MOHAMAD": "AHMMAD ZAKI ISAMUDDIN BIN MOHA",
  "METHDIOUSE ANAK SILAN": "METHDIOUSE AK SILAN",
  "MUHD ZAINUL 'IZZAT BIN ZAINUDIN": "MUHD ZAINUL IZZAT BIN ZAINUDIN",
  "AWANGKU MOHAMMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK": "AWANGKU MOHAMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK"
};

// Find user by name with fuzzy matching
function findUserByName(participantName, users) {
  // First try exact match
  let user = users.find(u => u.full_name === participantName);
  if (user) return user;

  // Try mapped name
  const mappedName = nameMappings[participantName];
  if (mappedName) {
    user = users.find(u => u.full_name === mappedName);
    if (user) return user;
  }

  // Try fuzzy matching
  const participantWords = participantName.toLowerCase().split(' ');
  for (const user of users) {
    const userWords = user.full_name.toLowerCase().split(' ');
    const matchCount = participantWords.filter(word => 
      userWords.some(userWord => userWord.includes(word) || word.includes(userWord))
    ).length;
    
    if (matchCount >= Math.ceil(participantWords.length * 0.7)) {
      console.log(`🔍 Fuzzy match found: "${participantName}" -> "${user.full_name}"`);
      return user;
    }
  }

  return null;
}

// Create combined BLS results from actual database data
function createCombinedBLSResults(quizSessions, checklistResults, users) {
  console.log('🔄 Creating combined BLS results from database...');
  
  // Create a map of profiles for quick lookup
  const profileMap = new Map();
  users.forEach(user => {
    profileMap.set(user.id, user);
  });
  
  // Group quiz sessions by user
  const quizByUser = {};
  quizSessions.forEach(session => {
    const userId = session.user_id;
    const profile = profileMap.get(userId);
    
    if (!profile) {
      console.log(`⚠️  No profile found for user ID: ${userId}`);
    }
    
    if (!quizByUser[userId]) {
      quizByUser[userId] = {
        user_id: userId,
        full_name: profile?.full_name || 'Unknown',
        ic: profile?.ic || 'N/A',
        pre_test: null,
        post_test: null
      };
    }
    
    if (session.quiz_key === 'pretest') {
      quizByUser[userId].pre_test = {
        score: session.score || 0,
        total_questions: session.total_questions || 30,
        submitted_at: session.submitted_at
      };
    } else if (session.quiz_key === 'posttest') {
      quizByUser[userId].post_test = {
        score: session.score || 0,
        total_questions: session.total_questions || 30,
        submitted_at: session.submitted_at
      };
    }
  });

  // Group checklist results by user
  const checklistByUser = {};
  checklistResults.forEach(result => {
    const userId = result.user_id;
    const profile = profileMap.get(userId);
    
    if (!profile) {
      console.log(`⚠️  No profile found for checklist user ID: ${userId}`);
    }
    
    if (!checklistByUser[userId]) {
      checklistByUser[userId] = {
        user_id: userId,
        full_name: profile?.full_name || 'Unknown',
        ic: profile?.ic || 'N/A',
        checklists: {}
      };
    }
    
    checklistByUser[userId].checklists[result.checklist_type] = {
      status: result.status,
      score: result.score,
      total_items: result.total_items,
      comments: result.comments,
      created_at: result.created_at
    };
  });

  // Combine the data
  const combinedResults = [];
  
  // Get all unique user IDs
  const allUserIds = new Set([...Object.keys(quizByUser), ...Object.keys(checklistByUser)]);
  
  allUserIds.forEach(userId => {
    const quizData = quizByUser[userId] || { user_id: userId, full_name: 'Unknown', ic: 'N/A' };
    const checklistData = checklistByUser[userId] || { user_id: userId, full_name: 'Unknown', ic: 'N/A', checklists: {} };
    
    const combinedResult = {
      user_id: userId,
      full_name: quizData.full_name || checklistData.full_name || 'Unknown',
      ic: quizData.ic || checklistData.ic || 'N/A',
      pre_test_score: quizData.pre_test?.score || 0,
      post_test_score: quizData.post_test?.score || 0,
      one_man_cpr_pass: checklistData.checklists['one-man-cpr']?.status === 'PASS' || false,
      two_man_cpr_pass: checklistData.checklists['two-man-cpr']?.status === 'PASS' || false,
      adult_choking_pass: checklistData.checklists['adult-choking']?.status === 'PASS' || false,
      infant_choking_pass: checklistData.checklists['infant-choking']?.status === 'PASS' || false,
      infant_cpr_pass: checklistData.checklists['infant-cpr']?.status === 'PASS' || false,
      one_man_cpr_details: checklistData.checklists['one-man-cpr']?.comments || `One Man CPR: ${checklistData.checklists['one-man-cpr']?.status || 'N/A'}`,
      two_man_cpr_details: checklistData.checklists['two-man-cpr']?.comments || `Two Man CPR: ${checklistData.checklists['two-man-cpr']?.status || 'N/A'}`,
      adult_choking_details: checklistData.checklists['adult-choking']?.comments || `Adult Choking: ${checklistData.checklists['adult-choking']?.status || 'N/A'}`,
      infant_choking_details: checklistData.checklists['infant-choking']?.comments || `Infant Choking: ${checklistData.checklists['infant-choking']?.status || 'N/A'}`,
      infant_cpr_details: checklistData.checklists['infant-cpr']?.comments || `Infant CPR: ${checklistData.checklists['infant-cpr']?.status || 'N/A'}`,
      created_at: new Date().toISOString()
    };
    
    combinedResults.push(combinedResult);
    console.log(`✅ Created combined result for ${combinedResult.full_name}`);
  });
  
  return combinedResults;
}

// Save combined results to a JSON file
function saveCombinedResults(combinedResults) {
  const fs = require('fs');
  const path = require('path');
  
  const outputPath = path.join(__dirname, 'final_combined_bls_results.json');
  
  try {
    fs.writeFileSync(outputPath, JSON.stringify(combinedResults, null, 2));
    console.log(`✅ Combined results saved to: ${outputPath}`);
    return true;
  } catch (error) {
    console.error('❌ Error saving combined results:', error);
    return false;
  }
}

// Display summary
function displaySummary(combinedResults) {
  console.log('\n📊 Final Combined BLS Results Summary:');
  console.log(`Total participants: ${combinedResults.length}`);
  
  let withPreTest = 0;
  let withPostTest = 0;
  let withChecklists = 0;
  let fullyComplete = 0;
  
  combinedResults.forEach(result => {
    if (result.pre_test_score > 0) withPreTest++;
    if (result.post_test_score > 0) withPostTest++;
    if (result.one_man_cpr_pass || result.two_man_cpr_pass || result.adult_choking_pass || 
        result.infant_choking_pass || result.infant_cpr_pass) withChecklists++;
    
    if (result.pre_test_score > 0 && result.post_test_score > 0 && 
        result.one_man_cpr_pass && result.two_man_cpr_pass && result.adult_choking_pass && 
        result.infant_choking_pass && result.infant_cpr_pass) {
      fullyComplete++;
    }
  });
  
  console.log(`Participants with pre-test: ${withPreTest}`);
  console.log(`Participants with post-test: ${withPostTest}`);
  console.log(`Participants with checklists: ${withChecklists}`);
  console.log(`Fully complete records: ${fullyComplete}`);
  
  console.log('\n📋 Sample combined results:');
  combinedResults.slice(0, 5).forEach((result, index) => {
    console.log(`${index + 1}. ${result.full_name}`);
    console.log(`   Pre-test: ${result.pre_test_score}, Post-test: ${result.post_test_score}`);
    console.log(`   CPR: ${result.one_man_cpr_pass ? 'PASS' : 'FAIL'}, Choking: ${result.adult_choking_pass ? 'PASS' : 'FAIL'}`);
  });
}

// Main function
async function main() {
  console.log('🚀 Creating final combined BLS data view...');
  
  try {
    // Fetch all data from database
    const [users, quizSessions, checklistResults] = await Promise.all([
      getExistingUsers(),
      getQuizSessions(),
      getChecklistResults()
    ]);
    
    if (users.length === 0) {
      console.log('❌ No users found. Exiting.');
      return;
    }
    
    if (quizSessions.length === 0 && checklistResults.length === 0) {
      console.log('❌ No quiz sessions or checklist results found. Exiting.');
      return;
    }
    
    // Create combined results from actual database data
    const combinedResults = createCombinedBLSResults(quizSessions, checklistResults, users);
    
    // Save to file
    saveCombinedResults(combinedResults);
    
    // Display summary
    displaySummary(combinedResults);
    
    console.log('\n✅ Final combined data view created successfully!');
    console.log('📁 Check final_combined_bls_results.json for the complete dataset.');
    
  } catch (error) {
    console.error('❌ Error creating combined view:', error);
  }
}

// Run the script
main().catch(console.error);
