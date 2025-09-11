// Critical Table Cleanup Script
import supabase from './services/supabase.js';

async function runCleanup() {
  console.log('🧹 Starting Critical Table Cleanup...\n');
  
  try {
    // 1. Fix Quiz Sessions Table
    console.log('1️⃣ Cleaning up Quiz Sessions table...');
    
    // Delete corrupted quiz sessions (undefined test_type and created_at)
    const { error: deleteCorrupted } = await supabase
      .from('quiz_sessions')
      .delete()
      .is('test_type', null)
      .is('created_at', null);
    
    if (deleteCorrupted) {
      console.log('⚠️  Error deleting corrupted quiz sessions:', deleteCorrupted);
    } else {
      console.log('✅ Deleted corrupted quiz sessions');
    }
    
    // Get remaining quiz sessions to check for duplicates
    const { data: remainingQuiz, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('*');
    
    if (quizError) {
      console.log('⚠️  Error fetching remaining quiz sessions:', quizError);
    } else {
      console.log(`📊 Found ${remainingQuiz.length} remaining quiz sessions`);
      
      // Remove duplicates (keep latest per user/type/date)
      const seen = new Set();
      const toDelete = [];
      
      remainingQuiz.forEach(session => {
        const key = `${session.user_id}_${session.test_type}_${session.created_at?.split('T')[0]}`;
        if (seen.has(key)) {
          toDelete.push(session.id);
        } else {
          seen.add(key);
        }
      });
      
      if (toDelete.length > 0) {
        const { error: deleteDuplicates } = await supabase
          .from('quiz_sessions')
          .delete()
          .in('id', toDelete);
        
        if (deleteDuplicates) {
          console.log('⚠️  Error deleting duplicate quiz sessions:', deleteDuplicates);
        } else {
          console.log(`✅ Deleted ${toDelete.length} duplicate quiz sessions`);
        }
      }
    }
    
    // 2. Clean up orphaned quiz sessions
    console.log('\n2️⃣ Cleaning up orphaned quiz sessions...');
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .not('role', 'in', '("admin","staff")');
    
    const profileIds = new Set(profiles.map(p => p.id));
    
    const { data: allQuiz } = await supabase
      .from('quiz_sessions')
      .select('id, user_id');
    
    const orphanedQuiz = allQuiz.filter(q => !profileIds.has(q.user_id));
    
    if (orphanedQuiz.length > 0) {
      const { error: deleteOrphaned } = await supabase
        .from('quiz_sessions')
        .delete()
        .in('id', orphanedQuiz.map(q => q.id));
      
      if (deleteOrphaned) {
        console.log('⚠️  Error deleting orphaned quiz sessions:', deleteOrphaned);
      } else {
        console.log(`✅ Deleted ${orphanedQuiz.length} orphaned quiz sessions`);
      }
    }
    
    // 3. Create missing checklist items
    console.log('\n3️⃣ Creating missing checklist items...');
    
    const checklistItems = [
      // One Man CPR
      { checklist_type: 'one-man-cpr', title: 'Check responsiveness', description: 'Check if victim is responsive', order_index: 1 },
      { checklist_type: 'one-man-cpr', title: 'Call for help', description: 'Call emergency services', order_index: 2 },
      { checklist_type: 'one-man-cpr', title: 'Open airway', description: 'Tilt head back and lift chin', order_index: 3 },
      { checklist_type: 'one-man-cpr', title: 'Check breathing', description: 'Look, listen, and feel for breathing', order_index: 4 },
      { checklist_type: 'one-man-cpr', title: 'Start compressions', description: 'Place hands on center of chest', order_index: 5 },
      { checklist_type: 'one-man-cpr', title: 'Compression depth', description: 'Compress at least 2 inches', order_index: 6 },
      { checklist_type: 'one-man-cpr', title: 'Compression rate', description: '100-120 compressions per minute', order_index: 7 },
      { checklist_type: 'one-man-cpr', title: 'Allow chest recoil', description: 'Allow chest to return to normal position', order_index: 8 },
      { checklist_type: 'one-man-cpr', title: 'Minimize interruptions', description: 'Keep interruptions under 10 seconds', order_index: 9 },
      { checklist_type: 'one-man-cpr', title: 'Continue until help arrives', description: 'Continue CPR until EMS arrives', order_index: 10 },
      
      // Two Man CPR
      { checklist_type: 'two-man-cpr', title: 'Check responsiveness', description: 'Check if victim is responsive', order_index: 1 },
      { checklist_type: 'two-man-cpr', title: 'Call for help', description: 'Call emergency services', order_index: 2 },
      { checklist_type: 'two-man-cpr', title: 'Open airway', description: 'Tilt head back and lift chin', order_index: 3 },
      { checklist_type: 'two-man-cpr', title: 'Check breathing', description: 'Look, listen, and feel for breathing', order_index: 4 },
      { checklist_type: 'two-man-cpr', title: 'Rescuer 1 starts compressions', description: 'First rescuer starts chest compressions', order_index: 5 },
      { checklist_type: 'two-man-cpr', title: 'Rescuer 2 gives breaths', description: 'Second rescuer gives rescue breaths', order_index: 6 },
      { checklist_type: 'two-man-cpr', title: 'Switch roles every 2 minutes', description: 'Switch compressor and breather roles', order_index: 7 },
      { checklist_type: 'two-man-cpr', title: 'Minimize interruptions', description: 'Keep interruptions under 10 seconds', order_index: 8 },
      { checklist_type: 'two-man-cpr', title: 'Coordinate efforts', description: 'Work together efficiently', order_index: 9 },
      { checklist_type: 'two-man-cpr', title: 'Continue until help arrives', description: 'Continue CPR until EMS arrives', order_index: 10 },
      
      // Adult Choking
      { checklist_type: 'adult-choking', title: 'Recognize choking signs', description: 'Universal choking sign, inability to speak', order_index: 1 },
      { checklist_type: 'adult-choking', title: 'Ask if choking', description: 'Ask "Are you choking?"', order_index: 2 },
      { checklist_type: 'adult-choking', title: 'Call for help', description: 'Call emergency services', order_index: 3 },
      { checklist_type: 'adult-choking', title: 'Perform abdominal thrusts', description: 'Stand behind victim, place hands above navel', order_index: 4 },
      { checklist_type: 'adult-choking', title: 'Thrust inward and upward', description: 'Quick inward and upward thrusts', order_index: 5 },
      { checklist_type: 'adult-choking', title: 'Continue until object expelled', description: 'Continue until object is expelled or victim becomes unconscious', order_index: 6 },
      { checklist_type: 'adult-choking', title: 'If unconscious, start CPR', description: 'If victim becomes unconscious, start CPR', order_index: 7 },
      { checklist_type: 'adult-choking', title: 'Check mouth for object', description: 'Look in mouth for expelled object', order_index: 8 },
      { checklist_type: 'adult-choking', title: 'Reassess after each thrust', description: 'Check if object has been expelled', order_index: 9 },
      { checklist_type: 'adult-choking', title: 'Continue until help arrives', description: 'Continue until EMS arrives', order_index: 10 },
      
      // Infant Choking
      { checklist_type: 'infant-choking', title: 'Recognize choking signs', description: 'Inability to cry, cough, or breathe', order_index: 1 },
      { checklist_type: 'infant-choking', title: 'Support head and neck', description: 'Support infant\'s head and neck', order_index: 2 },
      { checklist_type: 'infant-choking', title: 'Call for help', description: 'Call emergency services', order_index: 3 },
      { checklist_type: 'infant-choking', title: 'Give 5 back blows', description: 'Hold infant face down, give 5 back blows', order_index: 4 },
      { checklist_type: 'infant-choking', title: 'Turn infant over', description: 'Turn infant face up', order_index: 5 },
      { checklist_type: 'infant-choking', title: 'Give 5 chest thrusts', description: 'Give 5 chest thrusts with 2 fingers', order_index: 6 },
      { checklist_type: 'infant-choking', title: 'Repeat sequence', description: 'Repeat back blows and chest thrusts', order_index: 7 },
      { checklist_type: 'infant-choking', title: 'Check mouth for object', description: 'Look in mouth for expelled object', order_index: 8 },
      { checklist_type: 'infant-choking', title: 'If unconscious, start CPR', description: 'If infant becomes unconscious, start CPR', order_index: 9 },
      { checklist_type: 'infant-choking', title: 'Continue until help arrives', description: 'Continue until EMS arrives', order_index: 10 },
      
      // Infant CPR
      { checklist_type: 'infant-cpr', title: 'Check responsiveness', description: 'Check if infant is responsive', order_index: 1 },
      { checklist_type: 'infant-cpr', title: 'Call for help', description: 'Call emergency services', order_index: 2 },
      { checklist_type: 'infant-cpr', title: 'Open airway', description: 'Tilt head back slightly', order_index: 3 },
      { checklist_type: 'infant-cpr', title: 'Check breathing', description: 'Look, listen, and feel for breathing', order_index: 4 },
      { checklist_type: 'infant-cpr', title: 'Give 2 rescue breaths', description: 'Cover infant\'s mouth and nose, give 2 breaths', order_index: 5 },
      { checklist_type: 'infant-cpr', title: 'Start compressions', description: 'Place 2 fingers on center of chest', order_index: 6 },
      { checklist_type: 'infant-cpr', title: 'Compression depth', description: 'Compress about 1.5 inches', order_index: 7 },
      { checklist_type: 'infant-cpr', title: 'Compression rate', description: '100-120 compressions per minute', order_index: 8 },
      { checklist_type: 'infant-cpr', title: '30 compressions, 2 breaths', description: '30 compressions followed by 2 breaths', order_index: 9 },
      { checklist_type: 'infant-cpr', title: 'Continue until help arrives', description: 'Continue until EMS arrives', order_index: 10 }
    ];
    
    // Clear existing checklist items first
    const { error: deleteExisting } = await supabase
      .from('checklist_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteExisting) {
      console.log('⚠️  Error clearing existing checklist items:', deleteExisting);
    } else {
      console.log('✅ Cleared existing checklist items');
    }
    
    // Insert new checklist items
    const { error: insertItems } = await supabase
      .from('checklist_items')
      .insert(checklistItems);
    
    if (insertItems) {
      console.log('⚠️  Error inserting checklist items:', insertItems);
    } else {
      console.log(`✅ Created ${checklistItems.length} checklist items`);
    }
    
    // 4. Create missing questions
    console.log('\n4️⃣ Creating missing questions...');
    
    const questions = [
      // Pre-test questions
      { type: 'pre-test', question_text: 'What is the first step in CPR?', options: ['Check responsiveness', 'Call for help', 'Start compressions', 'Open airway'], correct_answer: 'Check responsiveness', explanation: 'The first step in CPR is to check if the victim is responsive by tapping their shoulder and shouting.' },
      { type: 'pre-test', question_text: 'How many compressions should you give in one cycle of CPR?', options: ['15', '20', '25', '30'], correct_answer: '30', explanation: 'The standard CPR cycle is 30 compressions followed by 2 rescue breaths.' },
      { type: 'pre-test', question_text: 'What is the correct compression rate for CPR?', options: ['60-80 per minute', '80-100 per minute', '100-120 per minute', '120-140 per minute'], correct_answer: '100-120 per minute', explanation: 'The correct compression rate for CPR is 100-120 compressions per minute.' },
      { type: 'pre-test', question_text: 'How deep should chest compressions be for an adult?', options: ['At least 1 inch', 'At least 2 inches', 'At least 3 inches', 'At least 4 inches'], correct_answer: 'At least 2 inches', explanation: 'Chest compressions for adults should be at least 2 inches deep.' },
      { type: 'pre-test', question_text: 'What should you do if someone is choking?', options: ['Give them water', 'Perform abdominal thrusts', 'Pat them on the back', 'Wait for them to cough'], correct_answer: 'Perform abdominal thrusts', explanation: 'For a choking victim, perform abdominal thrusts (Heimlich maneuver) to dislodge the object.' },
      
      // Post-test questions
      { type: 'post-test', question_text: 'What is the first step in CPR?', options: ['Check responsiveness', 'Call for help', 'Start compressions', 'Open airway'], correct_answer: 'Check responsiveness', explanation: 'The first step in CPR is to check if the victim is responsive by tapping their shoulder and shouting.' },
      { type: 'post-test', question_text: 'How many compressions should you give in one cycle of CPR?', options: ['15', '20', '25', '30'], correct_answer: '30', explanation: 'The standard CPR cycle is 30 compressions followed by 2 rescue breaths.' },
      { type: 'post-test', question_text: 'What is the correct compression rate for CPR?', options: ['60-80 per minute', '80-100 per minute', '100-120 per minute', '120-140 per minute'], correct_answer: '100-120 per minute', explanation: 'The correct compression rate for CPR is 100-120 compressions per minute.' },
      { type: 'post-test', question_text: 'How deep should chest compressions be for an adult?', options: ['At least 1 inch', 'At least 2 inches', 'At least 3 inches', 'At least 4 inches'], correct_answer: 'At least 2 inches', explanation: 'Chest compressions for adults should be at least 2 inches deep.' },
      { type: 'post-test', question_text: 'What should you do if someone is choking?', options: ['Give them water', 'Perform abdominal thrusts', 'Pat them on the back', 'Wait for them to cough'], correct_answer: 'Perform abdominal thrusts', explanation: 'For a choking victim, perform abdominal thrusts (Heimlich maneuver) to dislodge the object.' }
    ];
    
    // Clear existing questions first
    const { error: deleteExistingQuestions } = await supabase
      .from('questions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteExistingQuestions) {
      console.log('⚠️  Error clearing existing questions:', deleteExistingQuestions);
    } else {
      console.log('✅ Cleared existing questions');
    }
    
    // Insert new questions
    const { error: insertQuestions } = await supabase
      .from('questions')
      .insert(questions);
    
    if (insertQuestions) {
      console.log('⚠️  Error inserting questions:', insertQuestions);
    } else {
      console.log(`✅ Created ${questions.length} questions`);
    }
    
    // 5. Final verification
    console.log('\n5️⃣ Verifying cleanup results...');
    
    const { data: finalQuiz } = await supabase.from('quiz_sessions').select('*');
    const { data: finalChecklist } = await supabase.from('checklist_items').select('*');
    const { data: finalQuestions } = await supabase.from('questions').select('*');
    
    console.log('\n📊 CLEANUP RESULTS:');
    console.log(`• Quiz Sessions: ${finalQuiz?.length || 0} records`);
    console.log(`• Checklist Items: ${finalChecklist?.length || 0} records`);
    console.log(`• Questions: ${finalQuestions?.length || 0} records`);
    
    console.log('\n🎉 Critical table cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

runCleanup();
