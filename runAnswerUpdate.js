// Run Answer Update Script
// This script will automatically update all correct answers in your database

const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials (from supabase.js)
const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

// Correct answers based on KKM and NCORT guidelines
const correctAnswers = {
  patterns: [
    {
      keywords: ['infant', 'breathing', 'pernafasan bayi', 'bayi', 'breath'],
      answer: 'A',
      reason: 'Look, listen, feel approach for infant breathing check'
    },
    {
      keywords: ['compression', 'depth', 'adult', 'kedalaman', 'dewasa', 'mampatan'],
      answer: 'B',
      reason: 'Adult compression depth: at least 5cm but not more than 6cm'
    },
    {
      keywords: ['compression', 'rate', 'kadar', 'mampatan', 'per minute'],
      answer: 'C',
      reason: 'Compression rate: 100-120 per minute'
    },
    {
      keywords: ['AED', 'defibrillator', 'defibrilator', 'automated external'],
      answer: 'A',
      reason: 'Apply pads and follow voice prompts'
    },
    {
      keywords: ['recovery position', 'kedudukan pemulihan', 'recovery'],
      answer: 'B',
      reason: 'On side with head tilted back'
    },
    {
      keywords: ['choking', 'adult', 'tercekik', 'dewasa', 'heimlich'],
      answer: 'A',
      reason: 'Abdominal thrusts (Heimlich maneuver) for adults'
    },
    {
      keywords: ['choking', 'infant', 'tercekik', 'bayi', 'baby'],
      answer: 'B',
      reason: 'Back blows and chest thrusts for infants'
    },
    {
      keywords: ['pregnant', 'hamil', 'CPR', 'woman'],
      answer: 'C',
      reason: 'Standard CPR with slight left lateral tilt'
    },
    {
      keywords: ['drowning', 'lemas', 'water'],
      answer: 'A',
      reason: 'Start CPR immediately, don\'t waste time removing water'
    },
    {
      keywords: ['ratio', 'adult', 'nisbah', 'dewasa', 'compression', 'ventilation'],
      answer: 'B',
      reason: 'Adult compression to ventilation ratio: 30:2'
    },
    {
      keywords: ['ratio', 'child', 'nisbah', 'kanak-kanak', 'compression', 'ventilation'],
      answer: 'A',
      reason: 'Child ratio: 30:2 (single rescuer) or 15:2 (two rescuers)'
    },
    {
      keywords: ['infant', 'CPR', 'bayi', 'technique', 'method'],
      answer: 'C',
      reason: 'Use two fingers or two thumbs encircling hands'
    },
    {
      keywords: ['chain', 'survival', 'rantai', 'kelangsungan', 'life'],
      answer: 'A',
      reason: 'Early recognition, early CPR, early defibrillation, advanced care'
    },
    {
      keywords: ['depth', 'child', 'kedalaman', 'kanak-kanak', 'compression'],
      answer: 'B',
      reason: 'Child compression depth: at least one-third of chest depth'
    },
    {
      keywords: ['depth', 'infant', 'kedalaman', 'bayi', 'compression'],
      answer: 'C',
      reason: 'Infant compression depth: at least one-third of chest depth'
    },
    {
      keywords: ['ventilation', 'ventilasi', 'breathing', 'rescue breath'],
      answer: 'A',
      reason: 'Head tilt-chin lift, pinch nose, give breath over 1 second'
    },
    {
      keywords: ['two', 'rescuer', 'dua', 'penyelamat', 'rescuers'],
      answer: 'B',
      reason: 'One does compressions, other does ventilations'
    },
    {
      keywords: ['foreign body', 'airway obstruction', 'badan asing', 'halangan', 'obstruction'],
      answer: 'C',
      reason: 'Back blows and chest thrusts for infants, abdominal thrusts for adults'
    },
    {
      keywords: ['cardiac arrest', 'recognition', 'serangan jantung', 'pengiktirafan', 'arrest'],
      answer: 'A',
      reason: 'Unresponsive, not breathing normally, no pulse'
    },
    {
      keywords: ['high quality', 'CPR', 'berkualiti tinggi', 'quality'],
      answer: 'D',
      reason: 'All of the above: rate, depth, recoil, minimize interruptions'
    },
    {
      keywords: ['pad placement', 'AED placement', 'penempatan pad', 'electrode'],
      answer: 'B',
      reason: 'Upper right chest and lower left side'
    },
    {
      keywords: ['special situations', 'keadaan khas', 'special', 'situations'],
      answer: 'C',
      reason: 'Modify technique but maintain quality'
    },
    {
      keywords: ['team dynamics', 'dinamik pasukan', 'team', 'communication'],
      answer: 'A',
      reason: 'Clear communication, role clarity, mutual respect'
    },
    {
      keywords: ['post resuscitation', 'selepas resusitasi', 'post', 'after'],
      answer: 'B',
      reason: 'Maintain airway, monitor vital signs, prepare for transport'
    },
    {
      keywords: ['stop', 'cpr', 'when', 'bila', 'berhenti'],
      answer: 'D',
      reason: 'When victim shows signs of life, AED advises no shock, or too exhausted'
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
      const currentAnswer = question.correct_option;
      
      console.log(`\n🔍 Processing Question ${questionId}:`);
      console.log(`   Text: ${questionText.substring(0, 80)}...`);
      console.log(`   Current answer: ${currentAnswer || 'Not set'}`);
      
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
        if (currentAnswer === correctAnswer) {
          console.log(`   ✅ Already correct (${correctAnswer})`);
          skippedCount++;
        } else {
          console.log(`   🎯 Matched pattern: ${matchedPattern.reason}`);
          console.log(`   📝 Updating from '${currentAnswer || 'Not set'}' to '${correctAnswer}'`);
          
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
        }
      } else {
        console.log(`   ⚠️ Could not determine correct answer for question ${questionId}`);
        console.log(`   📝 Current answer: ${currentAnswer || 'Not set'}`);
        skippedCount++;
      }
    }
    
    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Updated: ${updatedCount} questions`);
    console.log(`   ⚠️ Skipped: ${skippedCount} questions`);
    console.log(`   📊 Total: ${questions.length} questions`);
    
    if (updatedCount > 0) {
      console.log(`\n🎉 Successfully updated ${updatedCount} questions with correct answers!`);
      console.log(`   You can now test the questions in your app.`);
    }
    
    if (skippedCount > 0) {
      console.log(`\n💡 ${skippedCount} questions were skipped. You may need to manually review these.`);
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
    console.log('   You can now test your questions in the app.');
  })
  .catch((error) => {
    console.error('\n💥 Update process failed:', error);
  });
