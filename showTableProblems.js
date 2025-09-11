// Show Table Problems - Diagnostic Script
import supabase from './services/supabase.js';

async function showTableProblems() {
  console.log('🔍 DIAGNOSING TABLE PROBLEMS...\n');
  
  try {
    // 1. Check Quiz Sessions Table Structure and Data
    console.log('1️⃣ QUIZ_SESSIONS TABLE PROBLEMS:');
    console.log('=' * 50);
    
    const { data: quizSessions, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .limit(5);
    
    if (quizError) {
      console.log('❌ Error fetching quiz sessions:', quizError);
    } else {
      console.log(`📊 Found ${quizSessions.length} quiz sessions (showing first 5):`);
      console.log('\nSample quiz session records:');
      quizSessions.forEach((session, index) => {
        console.log(`\nRecord ${index + 1}:`);
        console.log(`  ID: ${session.id}`);
        console.log(`  User ID: ${session.user_id}`);
        console.log(`  Test Type: ${session.test_type} (${typeof session.test_type})`);
        console.log(`  Created At: ${session.created_at} (${typeof session.created_at})`);
        console.log(`  Score: ${session.score}`);
        console.log(`  All fields:`, Object.keys(session));
      });
    }
    
    // 2. Check Questions Table Structure and Data
    console.log('\n\n2️⃣ QUESTIONS TABLE PROBLEMS:');
    console.log('=' * 50);
    
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .limit(5);
    
    if (questionsError) {
      console.log('❌ Error fetching questions:', questionsError);
    } else {
      console.log(`📊 Found ${questions.length} questions (showing first 5):`);
      console.log('\nSample question records:');
      questions.forEach((question, index) => {
        console.log(`\nRecord ${index + 1}:`);
        console.log(`  ID: ${question.id}`);
        console.log(`  Question Text: ${question.question_text}`);
        console.log(`  Type: ${question.type} (${typeof question.type})`);
        console.log(`  Correct Answer: ${question.correct_answer} (${typeof question.correct_answer})`);
        console.log(`  Options: ${question.options}`);
        console.log(`  All fields:`, Object.keys(question));
      });
    }
    
    // 3. Check Checklist Items Table Structure and Data
    console.log('\n\n3️⃣ CHECKLIST_ITEMS TABLE PROBLEMS:');
    console.log('=' * 50);
    
    const { data: checklistItems, error: checklistError } = await supabase
      .from('checklist_items')
      .select('*')
      .limit(5);
    
    if (checklistError) {
      console.log('❌ Error fetching checklist items:', checklistError);
    } else {
      console.log(`📊 Found ${checklistItems.length} checklist items (showing first 5):`);
      if (checklistItems.length > 0) {
        console.log('\nSample checklist item records:');
        checklistItems.forEach((item, index) => {
          console.log(`\nRecord ${index + 1}:`);
          console.log(`  ID: ${item.id}`);
          console.log(`  Checklist Type: ${item.checklist_type} (${typeof item.checklist_type})`);
          console.log(`  Title: ${item.title}`);
          console.log(`  Description: ${item.description}`);
          console.log(`  All fields:`, Object.keys(item));
        });
      } else {
        console.log('❌ No checklist items found in the table');
      }
    }
    
    // 4. Check what columns actually exist in each table
    console.log('\n\n4️⃣ TABLE SCHEMA ANALYSIS:');
    console.log('=' * 50);
    
    // Get sample records to see what columns exist
    const { data: sampleQuiz } = await supabase.from('quiz_sessions').select('*').limit(1);
    const { data: sampleQuestions } = await supabase.from('questions').select('*').limit(1);
    const { data: sampleChecklist } = await supabase.from('checklist_items').select('*').limit(1);
    
    console.log('\n📋 QUIZ_SESSIONS columns:');
    if (sampleQuiz && sampleQuiz.length > 0) {
      console.log('  Available columns:', Object.keys(sampleQuiz[0]));
      console.log('  Missing columns: test_type, created_at (if they show as undefined)');
    } else {
      console.log('  No records to analyze');
    }
    
    console.log('\n📋 QUESTIONS columns:');
    if (sampleQuestions && sampleQuestions.length > 0) {
      console.log('  Available columns:', Object.keys(sampleQuestions[0]));
      console.log('  Missing columns: type, correct_answer (if they show as undefined)');
    } else {
      console.log('  No records to analyze');
    }
    
    console.log('\n📋 CHECKLIST_ITEMS columns:');
    if (sampleChecklist && sampleChecklist.length > 0) {
      console.log('  Available columns:', Object.keys(sampleChecklist[0]));
      console.log('  Missing columns: checklist_type, title, description (if they show as undefined)');
    } else {
      console.log('  No records to analyze');
    }
    
    // 5. Show the exact SQL needed to fix these issues
    console.log('\n\n5️⃣ REQUIRED SQL FIXES:');
    console.log('=' * 50);
    
    console.log('\n🔧 Run this SQL in Supabase SQL Editor to fix the schema:');
    console.log('\n-- Fix Quiz Sessions Table');
    console.log('ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS test_type TEXT;');
    console.log('ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();');
    
    console.log('\n-- Fix Questions Table');
    console.log('ALTER TABLE questions ADD COLUMN IF NOT EXISTS type TEXT;');
    console.log('ALTER TABLE questions ADD COLUMN IF NOT EXISTS correct_answer TEXT;');
    
    console.log('\n-- Fix Checklist Items Table');
    console.log('ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS checklist_type TEXT;');
    console.log('ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS title TEXT;');
    console.log('ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS description TEXT;');
    console.log('ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS order_index INTEGER;');
    
    console.log('\n-- After adding columns, run the cleanup script again to populate data');
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }
}

showTableProblems();
