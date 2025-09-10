// Update Correct Answers Script
// Run this script to update all correct answers based on KKM and NCORT guidelines

// First, you need to get your Supabase credentials from your .env file or supabase.js
// Then run: node updateAnswers.js

const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

// Correct answers based on KKM and NCORT guidelines
const correctAnswers = {
  // Pattern matching for question content
  patterns: [
    {
      keywords: ['infant', 'breathing', 'pernafasan bayi'],
      answer: 'A',
      reason: 'Look, listen, feel approach for infant breathing check'
    },
    {
      keywords: ['compression', 'depth', 'adult', 'kedalaman', 'dewasa'],
      answer: 'B',
      reason: 'Adult compression depth: at least 5cm but not more than 6cm'
    },
    {
      keywords: ['compression', 'rate', 'kadar', 'mampatan'],
      answer: 'C',
      reason: 'Compression rate: 100-120 per minute'
    },
    {
      keywords: ['AED', 'defibrillator', 'defibrilator'],
      answer: 'A',
      reason: 'Apply pads and follow voice prompts'
    },
    {
      keywords: ['recovery position', 'kedudukan pemulihan'],
      answer: 'B',
      reason: 'On side with head tilted back'
    },
    {
      keywords: ['choking', 'adult', 'tercekik', 'dewasa'],
      answer: 'A',
      reason: 'Abdominal thrusts (Heimlich maneuver) for adults'
    },
    {
      keywords: ['choking', 'infant', 'tercekik', 'bayi'],
      answer: 'B',
      reason: 'Back blows and chest thrusts for infants'
    },
    {
      keywords: ['pregnant', 'hamil', 'CPR'],
      answer: 'C',
      reason: 'Standard CPR with slight left lateral tilt'
    },
    {
      keywords: ['drowning', 'lemas'],
      answer: 'A',
      reason: 'Start CPR immediately, don\'t waste time removing water'
    },
    {
      keywords: ['ratio', 'adult', 'nisbah', 'dewasa'],
      answer: 'B',
      reason: 'Adult compression to ventilation ratio: 30:2'
    },
    {
      keywords: ['ratio', 'child', 'nisbah', 'kanak-kanak'],
      answer: 'A',
      reason: 'Child ratio: 30:2 (single rescuer) or 15:2 (two rescuers)'
    },
    {
      keywords: ['infant', 'CPR', 'bayi'],
      answer: 'C',
      reason: 'Use two fingers or two thumbs encircling hands'
    },
    {
      keywords: ['chain', 'survival', 'rantai', 'kelangsungan'],
      answer: 'A',
      reason: 'Early recognition, early CPR, early defibrillation, advanced care'
    },
    {
      keywords: ['depth', 'child', 'kedalaman', 'kanak-kanak'],
      answer: 'B',
      reason: 'Child compression depth: at least one-third of chest depth'
    },
    {
      keywords: ['depth', 'infant', 'kedalaman', 'bayi'],
      answer: 'C',
      reason: 'Infant compression depth: at least one-third of chest depth'
    },
    {
      keywords: ['ventilation', 'ventilasi'],
      answer: 'A',
      reason: 'Head tilt-chin lift, pinch nose, give breath over 1 second'
    },
    {
      keywords: ['two', 'rescuer', 'dua', 'penyelamat'],
      answer: 'B',
      reason: 'One does compressions, other does ventilations'
    },
    {
      keywords: ['foreign body', 'airway obstruction', 'badan asing', 'halangan'],
      answer: 'C',
      reason: 'Back blows and chest thrusts for infants, abdominal thrusts for adults'
    },
    {
      keywords: ['cardiac arrest', 'recognition', 'serangan jantung', 'pengiktirafan'],
      answer: 'A',
      reason: 'Unresponsive, not breathing normally, no pulse'
    },
    {
      keywords: ['high quality', 'CPR', 'berkualiti tinggi'],
      answer: 'D',
      reason: 'All of the above: rate, depth, recoil, minimize interruptions'
    },
    {
      keywords: ['pad placement', 'AED placement', 'penempatan pad'],
      answer: 'B',
      reason: 'Upper right chest and lower left side'
    },
    {
      keywords: ['special situations', 'keadaan khas'],
      answer: 'C',
      reason: 'Modify technique but maintain quality'
    },
    {
      keywords: ['team dynamics', 'dinamik pasukan'],
      answer: 'A',
      reason: 'Clear communication, role clarity, mutual respect'
    },
    {
      keywords: ['post resuscitation', 'selepas resusitasi'],
      answer: 'B',
      reason: 'Maintain airway, monitor vital signs, prepare for transport'
    }
  ]
};

async function updateCorrectAnswers() {
  try {
    console.log('🔄 Fetching all questions from database...');
    
    // Get all questions
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*');
    
    if (error) {
      console.error('❌ Error fetching questions:', error);
      return;
    }
    
    console.log(`📊 Found ${questions.length} questions`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Process each question
    for (const question of questions) {
      const questionText = (question.question_text || '') + ' ' + (question.question_text_en || '');
      const questionId = question.id;
      
      console.log(`\n🔍 Processing Question ${questionId}:`);
      console.log(`   Text: ${questionText.substring(0, 100)}...`);
      
      // Try to match question content to determine correct answer
      let correctAnswer = null;
      let matchedPattern = null;
      
      for (const pattern of correctAnswers.patterns) {
        const isMatch = pattern.keywords.some(keyword => 
          questionText.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (isMatch) {
          correctAnswer = pattern.answer;
          matchedPattern = pattern;
          break;
        }
      }
      
      if (correctAnswer) {
        console.log(`   ✅ Matched pattern: ${matchedPattern.reason}`);
        console.log(`   📝 Setting correct answer to: ${correctAnswer}`);
        
        // Update the database
        const { error: updateError } = await supabase
          .from('questions')
          .update({ correct_option: correctAnswer })
          .eq('id', questionId);
        
        if (updateError) {
          console.error(`   ❌ Error updating question ${questionId}:`, updateError);
        } else {
          console.log(`   ✅ Successfully updated question ${questionId}`);
          updatedCount++;
        }
      } else {
        console.log(`   ⚠️ Could not determine correct answer for question ${questionId}`);
        console.log(`   📝 Current answer: ${question.correct_option || 'Not set'}`);
        skippedCount++;
      }
    }
    
    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Updated: ${updatedCount} questions`);
    console.log(`   ⚠️ Skipped: ${skippedCount} questions`);
    console.log(`   📊 Total: ${questions.length} questions`);
    
    if (skippedCount > 0) {
      console.log(`\n💡 For skipped questions, you may need to manually review and set correct answers.`);
      console.log(`   Use the EditQuestionsScreen to manually set answers for questions that couldn't be automatically matched.`);
    }
    
  } catch (error) {
    console.error('❌ Error in updateCorrectAnswers:', error);
  }
}

// Run the update
console.log('🚀 Starting BLS Correct Answers Update...');
console.log('📋 Based on KKM and NCORT Guidelines');
console.log('=' .repeat(50));

updateCorrectAnswers()
  .then(() => {
    console.log('\n🎉 Update process completed!');
  })
  .catch((error) => {
    console.error('\n💥 Update process failed:', error);
  });
