// View Table Data - Show actual data in each table
import supabase from './services/supabase.js';

async function viewTableData() {
  console.log('📊 VIEWING TABLE DATA...\n');
  
  try {
    // 1. QUIZ_SESSIONS TABLE DATA
    console.log('1️⃣ QUIZ_SESSIONS TABLE DATA:');
    console.log('=' * 60);
    
    const { data: quizSessions, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .limit(10);
    
    if (quizError) {
      console.log('❌ Error:', quizError);
    } else {
      console.log(`📈 Total records: ${quizSessions.length} (showing first 10)`);
      console.log('\n📋 Available columns:', Object.keys(quizSessions[0] || {}));
      console.log('\n📝 Sample records:');
      
      quizSessions.forEach((record, index) => {
        console.log(`\n--- Record ${index + 1} ---`);
        Object.entries(record).forEach(([key, value]) => {
          const displayValue = value === null ? 'NULL' : 
                              value === undefined ? 'UNDEFINED' : 
                              typeof value === 'object' ? JSON.stringify(value) : 
                              String(value);
          console.log(`  ${key}: ${displayValue}`);
        });
      });
    }
    
    // 2. QUESTIONS TABLE DATA
    console.log('\n\n2️⃣ QUESTIONS TABLE DATA:');
    console.log('=' * 60);
    
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .limit(10);
    
    if (questionsError) {
      console.log('❌ Error:', questionsError);
    } else {
      console.log(`📈 Total records: ${questions.length} (showing first 10)`);
      console.log('\n📋 Available columns:', Object.keys(questions[0] || {}));
      console.log('\n📝 Sample records:');
      
      questions.forEach((record, index) => {
        console.log(`\n--- Record ${index + 1} ---`);
        Object.entries(record).forEach(([key, value]) => {
          const displayValue = value === null ? 'NULL' : 
                              value === undefined ? 'UNDEFINED' : 
                              typeof value === 'object' ? JSON.stringify(value) : 
                              String(value);
          console.log(`  ${key}: ${displayValue}`);
        });
      });
    }
    
    // 3. CHECKLIST_ITEMS TABLE DATA
    console.log('\n\n3️⃣ CHECKLIST_ITEMS TABLE DATA:');
    console.log('=' * 60);
    
    const { data: checklistItems, error: checklistError } = await supabase
      .from('checklist_items')
      .select('*')
      .limit(10);
    
    if (checklistError) {
      console.log('❌ Error:', checklistError);
    } else {
      console.log(`📈 Total records: ${checklistItems.length} (showing first 10)`);
      if (checklistItems.length > 0) {
        console.log('\n📋 Available columns:', Object.keys(checklistItems[0] || {}));
        console.log('\n📝 Sample records:');
        
        checklistItems.forEach((record, index) => {
          console.log(`\n--- Record ${index + 1} ---`);
          Object.entries(record).forEach(([key, value]) => {
            const displayValue = value === null ? 'NULL' : 
                                value === undefined ? 'UNDEFINED' : 
                                typeof value === 'object' ? JSON.stringify(value) : 
                                String(value);
            console.log(`  ${key}: ${displayValue}`);
          });
        });
      } else {
        console.log('❌ No records found in checklist_items table');
      }
    }
    
    // 4. CHECKLIST_RESULTS TABLE DATA (for reference)
    console.log('\n\n4️⃣ CHECKLIST_RESULTS TABLE DATA:');
    console.log('=' * 60);
    
    const { data: checklistResults, error: checklistResultsError } = await supabase
      .from('checklist_results')
      .select('*')
      .limit(5);
    
    if (checklistResultsError) {
      console.log('❌ Error:', checklistResultsError);
    } else {
      console.log(`📈 Total records: ${checklistResults.length} (showing first 5)`);
      console.log('\n📋 Available columns:', Object.keys(checklistResults[0] || {}));
      console.log('\n📝 Sample records:');
      
      checklistResults.forEach((record, index) => {
        console.log(`\n--- Record ${index + 1} ---`);
        Object.entries(record).forEach(([key, value]) => {
          const displayValue = value === null ? 'NULL' : 
                              value === undefined ? 'UNDEFINED' : 
                              typeof value === 'object' ? JSON.stringify(value) : 
                              String(value);
          console.log(`  ${key}: ${displayValue}`);
        });
      });
    }
    
    // 5. BLS_RESULTS TABLE DATA (for reference)
    console.log('\n\n5️⃣ BLS_RESULTS TABLE DATA:');
    console.log('=' * 60);
    
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('*')
      .limit(3);
    
    if (blsError) {
      console.log('❌ Error:', blsError);
    } else {
      console.log(`📈 Total records: ${blsResults.length} (showing first 3)`);
      console.log('\n📋 Available columns:', Object.keys(blsResults[0] || {}));
      console.log('\n📝 Sample records:');
      
      blsResults.forEach((record, index) => {
        console.log(`\n--- Record ${index + 1} ---`);
        Object.entries(record).forEach(([key, value]) => {
          const displayValue = value === null ? 'NULL' : 
                              value === undefined ? 'UNDEFINED' : 
                              typeof value === 'object' ? JSON.stringify(value) : 
                              String(value);
          console.log(`  ${key}: ${displayValue}`);
        });
      });
    }
    
    // 6. PROFILES TABLE DATA (for reference)
    console.log('\n\n6️⃣ PROFILES TABLE DATA:');
    console.log('=' * 60);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(3);
    
    if (profilesError) {
      console.log('❌ Error:', profilesError);
    } else {
      console.log(`📈 Total records: ${profiles.length} (showing first 3)`);
      console.log('\n📋 Available columns:', Object.keys(profiles[0] || {}));
      console.log('\n📝 Sample records:');
      
      profiles.forEach((record, index) => {
        console.log(`\n--- Record ${index + 1} ---`);
        Object.entries(record).forEach(([key, value]) => {
          const displayValue = value === null ? 'NULL' : 
                              value === undefined ? 'UNDEFINED' : 
                              typeof value === 'object' ? JSON.stringify(value) : 
                              String(value);
          console.log(`  ${key}: ${displayValue}`);
        });
      });
    }
    
    console.log('\n\n📊 DATA SUMMARY:');
    console.log('=' * 60);
    console.log(`• Quiz Sessions: ${quizSessions?.length || 0} records`);
    console.log(`• Questions: ${questions?.length || 0} records`);
    console.log(`• Checklist Items: ${checklistItems?.length || 0} records`);
    console.log(`• Checklist Results: ${checklistResults?.length || 0} records`);
    console.log(`• BLS Results: ${blsResults?.length || 0} records`);
    console.log(`• Profiles: ${profiles?.length || 0} records`);
    
  } catch (error) {
    console.error('❌ Error viewing table data:', error);
  }
}

viewTableData();
