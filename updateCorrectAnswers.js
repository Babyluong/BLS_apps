// Script to update correct answers based on KKM and NCORT guidelines
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';
const supabase = createClient(supabaseUrl, supabaseKey);

// KKM and NCORT Guidelines for BLS Questions
const correctAnswers = {
  // Pre-Test Questions
  "Pre_Test": {
    // Question about infant breathing check
    "infant_breathing_check": "A", // Listen with ear, look for chest movement, and feel breath on cheek
    
    // CPR compression depth for adults
    "adult_cpr_depth": "B", // At least 5cm but not more than 6cm
    
    // CPR compression rate
    "cpr_compression_rate": "C", // 100-120 compressions per minute
    
    // AED usage
    "aed_usage": "A", // Apply pads and follow voice prompts
    
    // Recovery position
    "recovery_position": "B", // On side with head tilted back
    
    // Choking adult
    "choking_adult": "A", // Abdominal thrusts (Heimlich maneuver)
    
    // Choking infant
    "choking_infant": "B", // Back blows and chest thrusts
    
    // CPR for pregnant woman
    "cpr_pregnant": "C", // Standard CPR with slight left lateral tilt
    
    // Drowning victim
    "drowning_victim": "A", // Start CPR immediately, don't waste time removing water
    
    // CPR quality indicators
    "cpr_quality": "B", // Allow full chest recoil between compressions
  },
  
  // Post-Test Questions (SET A, B, C)
  "SET_A": {
    // Basic life support sequence
    "bls_sequence": "A", // Check responsiveness, call for help, check breathing, start CPR
    
    // Compression to ventilation ratio for adults
    "adult_ratio": "B", // 30:2
    
    // Compression to ventilation ratio for children
    "child_ratio": "A", // 30:2 (single rescuer) or 15:2 (two rescuers)
    
    // Infant CPR technique
    "infant_cpr": "C", // Use two fingers or two thumbs encircling hands
    
    // AED for children
    "aed_children": "B", // Use pediatric pads if available, otherwise adult pads
    
    // When to stop CPR
    "stop_cpr": "D", // When victim shows signs of life, AED advises no shock, or too exhausted
  },
  
  "SET_B": {
    // Chain of survival
    "chain_survival": "A", // Early recognition, early CPR, early defibrillation, advanced care
    
    // Compression depth for children
    "child_depth": "B", // At least one-third of chest depth (about 4cm)
    
    // Compression depth for infants
    "infant_depth": "C", // At least one-third of chest depth (about 4cm)
    
    // Ventilation technique
    "ventilation_technique": "A", // Head tilt-chin lift, pinch nose, give breath over 1 second
    
    // Two-rescuer CPR
    "two_rescuer": "B", // One does compressions, other does ventilations
    
    // Foreign body airway obstruction
    "fbao": "C", // Back blows and chest thrusts for infants, abdominal thrusts for adults
  },
  
  "SET_C": {
    // Recognition of cardiac arrest
    "cardiac_arrest": "A", // Unresponsive, not breathing normally, no pulse
    
    // High-quality CPR characteristics
    "high_quality_cpr": "D", // All of the above (rate, depth, recoil, minimize interruptions)
    
    // AED pad placement
    "aed_placement": "B", // Upper right chest and lower left side
    
    // Special situations
    "special_situations": "C", // Modify technique but maintain quality
    
    // Team dynamics
    "team_dynamics": "A", // Clear communication, role clarity, mutual respect
    
    // Post-resuscitation care
    "post_resuscitation": "B", // Maintain airway, monitor vital signs, prepare for transport
  }
};

// Function to update correct answers in database
async function updateCorrectAnswers() {
  try {
    console.log('Fetching all questions from database...');
    
    // Get all questions
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*');
    
    if (error) {
      console.error('Error fetching questions:', error);
      return;
    }
    
    console.log(`Found ${questions.length} questions`);
    
    // Process each question and update correct answers
    for (const question of questions) {
      const questionSet = question.soalan_set || question.question_set || 'Pre_Test';
      const questionText = question.question_text || question.question_text_en || '';
      
      // Try to match question content to determine correct answer
      let correctAnswer = null;
      
      // Check for specific question patterns
      if (questionText.includes('infant') && questionText.includes('breathing')) {
        correctAnswer = 'A'; // Listen with ear, look for chest movement, and feel breath on cheek
      } else if (questionText.includes('compression') && questionText.includes('depth') && questionText.includes('adult')) {
        correctAnswer = 'B'; // At least 5cm but not more than 6cm
      } else if (questionText.includes('compression') && questionText.includes('rate')) {
        correctAnswer = 'C'; // 100-120 compressions per minute
      } else if (questionText.includes('AED') || questionText.includes('defibrillator')) {
        correctAnswer = 'A'; // Apply pads and follow voice prompts
      } else if (questionText.includes('recovery position')) {
        correctAnswer = 'B'; // On side with head tilted back
      } else if (questionText.includes('choking') && questionText.includes('adult')) {
        correctAnswer = 'A'; // Abdominal thrusts
      } else if (questionText.includes('choking') && questionText.includes('infant')) {
        correctAnswer = 'B'; // Back blows and chest thrusts
      } else if (questionText.includes('pregnant') && questionText.includes('CPR')) {
        correctAnswer = 'C'; // Standard CPR with slight left lateral tilt
      } else if (questionText.includes('drowning')) {
        correctAnswer = 'A'; // Start CPR immediately
      } else if (questionText.includes('ratio') && questionText.includes('adult')) {
        correctAnswer = 'B'; // 30:2
      } else if (questionText.includes('ratio') && questionText.includes('child')) {
        correctAnswer = 'A'; // 30:2 or 15:2
      } else if (questionText.includes('infant') && questionText.includes('CPR')) {
        correctAnswer = 'C'; // Use two fingers or two thumbs
      } else if (questionText.includes('chain') && questionText.includes('survival')) {
        correctAnswer = 'A'; // Early recognition, early CPR, early defibrillation, advanced care
      } else if (questionText.includes('depth') && questionText.includes('child')) {
        correctAnswer = 'B'; // At least one-third of chest depth
      } else if (questionText.includes('depth') && questionText.includes('infant')) {
        correctAnswer = 'C'; // At least one-third of chest depth
      } else if (questionText.includes('ventilation')) {
        correctAnswer = 'A'; // Head tilt-chin lift, pinch nose, give breath over 1 second
      } else if (questionText.includes('two') && questionText.includes('rescuer')) {
        correctAnswer = 'B'; // One does compressions, other does ventilations
      } else if (questionText.includes('foreign body') || questionText.includes('airway obstruction')) {
        correctAnswer = 'C'; // Back blows and chest thrusts for infants, abdominal thrusts for adults
      } else if (questionText.includes('cardiac arrest') && questionText.includes('recognition')) {
        correctAnswer = 'A'; // Unresponsive, not breathing normally, no pulse
      } else if (questionText.includes('high quality') && questionText.includes('CPR')) {
        correctAnswer = 'D'; // All of the above
      } else if (questionText.includes('pad placement') || questionText.includes('AED placement')) {
        correctAnswer = 'B'; // Upper right chest and lower left side
      } else if (questionText.includes('special situations')) {
        correctAnswer = 'C'; // Modify technique but maintain quality
      } else if (questionText.includes('team dynamics')) {
        correctAnswer = 'A'; // Clear communication, role clarity, mutual respect
      } else if (questionText.includes('post resuscitation')) {
        correctAnswer = 'B'; // Maintain airway, monitor vital signs, prepare for transport
      }
      
      // If we found a correct answer, update the database
      if (correctAnswer) {
        console.log(`Updating question ${question.id}: ${questionText.substring(0, 50)}... -> Answer: ${correctAnswer}`);
        
        const { error: updateError } = await supabase
          .from('questions')
          .update({ correct_option: correctAnswer })
          .eq('id', question.id);
        
        if (updateError) {
          console.error(`Error updating question ${question.id}:`, updateError);
        } else {
          console.log(`✅ Successfully updated question ${question.id}`);
        }
      } else {
        console.log(`⚠️ Could not determine correct answer for question ${question.id}: ${questionText.substring(0, 50)}...`);
      }
    }
    
    console.log('✅ Finished updating correct answers');
    
  } catch (error) {
    console.error('Error in updateCorrectAnswers:', error);
  }
}

// Run the update
updateCorrectAnswers();
