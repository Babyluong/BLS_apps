// scripts/testQuestionEdit.js
// Test script to verify question editing works without errors

import { createClient } from '@supabase/supabase-js';

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuestionEdit() {
  console.log('🧪 Testing question edit functionality...');
  
  try {
    // Test 1: Get a question to test with
    console.log('📋 Test 1: Getting a question to test with...');
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, question_text, correct_option')
      .limit(1);
    
    if (questionsError) {
      console.error('❌ Cannot access questions table:', questionsError.message);
      return false;
    }
    
    if (!questions || questions.length === 0) {
      console.error('❌ No questions found to test with');
      return false;
    }
    
    const testQuestion = questions[0];
    console.log(`✅ Found test question: ${testQuestion.id}`);
    
    // Test 2: Try to update the question (simulate edit)
    console.log('✏️ Test 2: Testing question update...');
    
    const originalText = testQuestion.question_text;
    const testText = originalText + ' [TEST]';
    
    const { error: updateError } = await supabase
      .from('questions')
      .update({ question_text: testText })
      .eq('id', testQuestion.id);
    
    if (updateError) {
      if (updateError.message && updateError.message.includes('recalculate_scores_for_question')) {
        console.log('⚠️ Expected error: recalculate_scores_for_question function missing');
        console.log('📋 This is the error we need to fix');
        return false;
      } else {
        console.error('❌ Unexpected error:', updateError.message);
        return false;
      }
    }
    
    console.log('✅ Question update successful!');
    
    // Test 3: Restore the original text
    console.log('🔄 Test 3: Restoring original text...');
    const { error: restoreError } = await supabase
      .from('questions')
      .update({ question_text: originalText })
      .eq('id', testQuestion.id);
    
    if (restoreError) {
      console.warn('⚠️ Could not restore original text:', restoreError.message);
    } else {
      console.log('✅ Original text restored');
    }
    
    console.log('🎉 All tests passed! Question editing should work now.');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testQuestionEdit()
    .then(success => {
      if (success) {
        console.log('🎉 Question edit test passed!');
        console.log('📋 The recalculate_scores_for_question error should be fixed');
      } else {
        console.log('❌ Question edit test failed');
        console.log('📋 You may need to run the fixTriggerError.sql script');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default testQuestionEdit;
