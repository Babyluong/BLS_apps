// Show Table Content - Display actual data inside each table
import supabase from './services/supabase.js';

async function showTableContent() {
  console.log('📊 SHOWING TABLE CONTENT...\n');
  
  try {
    // 1. QUIZ_SESSIONS TABLE CONTENT
    console.log('1️⃣ QUIZ_SESSIONS TABLE CONTENT:');
    console.log('=' * 80);
    
    const { data: quizSessions, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .limit(5);
    
    if (quizError) {
      console.log('❌ Error:', quizError);
    } else {
      console.log(`📈 Total records: ${quizSessions.length} (showing first 5)`);
      console.log('\n📋 Available columns:', Object.keys(quizSessions[0] || {}));
      console.log('\n📝 Sample records with actual data:');
      
      quizSessions.forEach((record, index) => {
        console.log(`\n--- Record ${index + 1} ---`);
        console.log(`ID: ${record.id}`);
        console.log(`User ID: ${record.user_id}`);
        console.log(`Quiz Key: ${record.quiz_key}`);
        console.log(`Started At: ${record.started_at}`);
        console.log(`Expires At: ${record.expires_at}`);
        console.log(`Status: ${record.status}`);
        console.log(`Score: ${record.score}`);
        console.log(`Total Questions: ${record.total_questions}`);
        console.log(`Percentage: ${record.percentage}`);
        console.log(`Participant Name: ${record.participant_name}`);
        console.log(`Participant IC: ${record.participant_ic}`);
        console.log(`Set Identifier: ${record.set_identifier}`);
        console.log(`Updated At: ${record.updated_at}`);
        console.log(`Answers: ${JSON.stringify(record.answers, null, 2)}`);
      });
    }
    
    // 2. QUESTIONS TABLE CONTENT
    console.log('\n\n2️⃣ QUESTIONS TABLE CONTENT:');
    console.log('=' * 80);
    
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .limit(5);
    
    if (questionsError) {
      console.log('❌ Error:', questionsError);
    } else {
      console.log(`📈 Total records: ${questions.length} (showing first 5)`);
      console.log('\n📋 Available columns:', Object.keys(questions[0] || {}));
      console.log('\n📝 Sample records with actual data:');
      
      questions.forEach((record, index) => {
        console.log(`\n--- Record ${index + 1} ---`);
        console.log(`ID: ${record.id}`);
        console.log(`Created At: ${record.created_at}`);
        console.log(`Question Text: ${record.question_text}`);
        console.log(`Option A: ${record.option_a}`);
        console.log(`Option B: ${record.option_b}`);
        console.log(`Option C: ${record.option_c}`);
        console.log(`Option D: ${record.option_d}`);
        console.log(`Correct Option: ${record.correct_option}`);
        console.log(`Soalan Set: ${record.soalan_set}`);
        console.log(`Question Text EN: ${record.question_text_en}`);
        console.log(`Option A EN: ${record.option_a_en}`);
        console.log(`Option B EN: ${record.option_b_en}`);
        console.log(`Option C EN: ${record.option_c_en}`);
        console.log(`Option D EN: ${record.option_d_en}`);
      });
    }
    
    // 3. CHECKLIST_ITEMS TABLE CONTENT
    console.log('\n\n3️⃣ CHECKLIST_ITEMS TABLE CONTENT:');
    console.log('=' * 80);
    
    const { data: checklistItems, error: checklistError } = await supabase
      .from('checklist_items')
      .select('*')
      .limit(5);
    
    if (checklistError) {
      console.log('❌ Error:', checklistError);
    } else {
      console.log(`📈 Total records: ${checklistItems.length} (showing first 5)`);
      if (checklistItems.length > 0) {
        console.log('\n📋 Available columns:', Object.keys(checklistItems[0] || {}));
        console.log('\n📝 Sample records with actual data:');
        
        checklistItems.forEach((record, index) => {
          console.log(`\n--- Record ${index + 1} ---`);
          Object.entries(record).forEach(([key, value]) => {
            console.log(`${key}: ${value}`);
          });
        });
      } else {
        console.log('❌ No records found in checklist_items table');
        console.log('📋 This table is completely empty');
      }
    }
    
    // 4. CHECKLIST_RESULTS TABLE CONTENT
    console.log('\n\n4️⃣ CHECKLIST_RESULTS TABLE CONTENT:');
    console.log('=' * 80);
    
    const { data: checklistResults, error: checklistResultsError } = await supabase
      .from('checklist_results')
      .select('*')
      .limit(3);
    
    if (checklistResultsError) {
      console.log('❌ Error:', checklistResultsError);
    } else {
      console.log(`📈 Total records: ${checklistResults.length} (showing first 3)`);
      console.log('\n📋 Available columns:', Object.keys(checklistResults[0] || {}));
      console.log('\n📝 Sample records with actual data:');
      
      checklistResults.forEach((record, index) => {
        console.log(`\n--- Record ${index + 1} ---`);
        console.log(`ID: ${record.id}`);
        console.log(`User ID: ${record.user_id}`);
        console.log(`Checklist Type: ${record.checklist_type}`);
        console.log(`Pass: ${record.pass}`);
        console.log(`Score: ${record.score}`);
        console.log(`Status: ${record.status}`);
        console.log(`Percentage: ${record.percentage}`);
        console.log(`Total Items: ${record.total_items}`);
        console.log(`Performed: ${JSON.stringify(record.performed, null, 2)}`);
        console.log(`Not Performed: ${JSON.stringify(record.not_performed, null, 2)}`);
        console.log(`Standardized Items: ${JSON.stringify(record.standardized_items, null, 2)}`);
        console.log(`Comments: ${record.comments}`);
        console.log(`Assessment Date: ${record.assessment_date}`);
        console.log(`Duration Seconds: ${record.duration_seconds}`);
      });
    }
    
    // 5. BLS_RESULTS TABLE CONTENT
    console.log('\n\n5️⃣ BLS_RESULTS TABLE CONTENT:');
    console.log('=' * 80);
    
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('*')
      .limit(2);
    
    if (blsError) {
      console.log('❌ Error:', blsError);
    } else {
      console.log(`📈 Total records: ${blsResults.length} (showing first 2)`);
      console.log('\n📋 Available columns:', Object.keys(blsResults[0] || {}));
      console.log('\n📝 Sample records with actual data:');
      
      blsResults.forEach((record, index) => {
        console.log(`\n--- Record ${index + 1} ---`);
        console.log(`ID: ${record.id}`);
        console.log(`User ID: ${record.user_id}`);
        console.log(`Created At: ${record.created_at}`);
        console.log(`Updated At: ${record.updated_at}`);
        console.log(`Pre Test Score: ${record.pre_test_score}`);
        console.log(`Post Test Score: ${record.post_test_score}`);
        console.log(`One Man CPR Pass: ${record.one_man_cpr_pass}`);
        console.log(`Two Man CPR Pass: ${record.two_man_cpr_pass}`);
        console.log(`Adult Choking Pass: ${record.adult_choking_pass}`);
        console.log(`Infant Choking Pass: ${record.infant_choking_pass}`);
        console.log(`Infant CPR Pass: ${record.infant_cpr_pass}`);
        console.log(`Remedial Allowed: ${record.remedial_allowed}`);
        console.log(`Certified: ${record.certified}`);
        console.log(`Participant IC: ${record.participant_ic}`);
        console.log(`Participant Name: ${record.participant_name}`);
        console.log(`Jawatan: ${record.jawatan}`);
        console.log(`Posttest Set: ${record.posttest_set}`);
        console.log(`Comments: ${record.comments}`);
      });
    }
    
    // 6. PROFILES TABLE CONTENT
    console.log('\n\n6️⃣ PROFILES TABLE CONTENT:');
    console.log('=' * 80);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(3);
    
    if (profilesError) {
      console.log('❌ Error:', profilesError);
    } else {
      console.log(`📈 Total records: ${profiles.length} (showing first 3)`);
      console.log('\n📋 Available columns:', Object.keys(profiles[0] || {}));
      console.log('\n📝 Sample records with actual data:');
      
      profiles.forEach((record, index) => {
        console.log(`\n--- Record ${index + 1} ---`);
        console.log(`ID: ${record.id}`);
        console.log(`Email: ${record.email}`);
        console.log(`Full Name: ${record.full_name}`);
        console.log(`Role: ${record.role}`);
        console.log(`Created At: ${record.created_at}`);
        console.log(`Updated At: ${record.updated_at}`);
        console.log(`IC: ${record.ic}`);
        console.log(`Phone Number: ${record.phone_number}`);
        console.log(`Tempat Bertugas: ${record.tempat_bertugas}`);
        console.log(`Jawatan: ${record.jawatan}`);
        console.log(`ID Number: ${record.id_number}`);
        console.log(`BLS Last Year: ${record.bls_last_year}`);
        console.log(`Alergik: ${record.alergik}`);
        console.log(`Alergik Details: ${record.alergik_details}`);
        console.log(`Asma: ${record.asma}`);
        console.log(`Hamil: ${record.hamil}`);
        console.log(`Hamil Weeks: ${record.hamil_weeks}`);
        console.log(`Alergik Terhadap: ${record.alergik_terhadap}`);
      });
    }
    
    console.log('\n\n📊 CONTENT SUMMARY:');
    console.log('=' * 80);
    console.log(`• Quiz Sessions: ${quizSessions?.length || 0} records - Has quiz data but missing test_type, created_at`);
    console.log(`• Questions: ${questions?.length || 0} records - Has question data but missing type, correct_answer, options`);
    console.log(`• Checklist Items: ${checklistItems?.length || 0} records - EMPTY TABLE`);
    console.log(`• Checklist Results: ${checklistResults?.length || 0} records - Has assessment data`);
    console.log(`• BLS Results: ${blsResults?.length || 0} records - Has BLS assessment data`);
    console.log(`• Profiles: ${profiles?.length || 0} records - Has user profile data`);
    
  } catch (error) {
    console.error('❌ Error showing table content:', error);
  }
}

showTableContent();
