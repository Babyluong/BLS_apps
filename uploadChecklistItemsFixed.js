// uploadChecklistItemsFixed.js
// Upload all BLS checklist items to Supabase checklist_items table (Fixed RLS issue)

const { createClient } = require('@supabase/supabase-js');

// Use service role key to bypass RLS
const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.YourServiceRoleKeyHere'
);

// All BLS checklist items organized by station
const checklistData = {
  'one-man-cpr': {
    'danger-ppe': {
      text: 'Wear PPE (gloves, apron, mask), look out for blood spills, sharps, electric wires, Unsteady beds, trolley',
      compulsory: false,
      category: 'DANGER'
    },
    'response-tap-shoulders': {
      text: 'a. Tap shoulders',
      compulsory: false,
      category: 'RESPONSE'
    },
    'response-shout-call-adult': {
      text: 'b. Shout & speak "CALL THE ADULT"',
      compulsory: false,
      category: 'RESPONSE'
    },
    'shout-emergency': {
      text: 'a. For IHCA - Shout "Emergency! Emergency! Bring the resuscitation trolley and defibrillator/AED!"',
      compulsory: false,
      category: 'SHOUT FOR HELP'
    },
    'airway-head-tilt-chin-lift': {
      text: 'a. Head Tilt Chin Lift',
      compulsory: true,
      category: 'AIRWAY'
    },
    'airway-jaw-thrust': {
      text: 'b. Jaw Thrust (Trauma)',
      compulsory: false,
      category: 'AIRWAY'
    },
    'breathing-look-normal-breathing': {
      text: 'a. Look for normal breathing, which should not take more than 10 seconds',
      compulsory: true,
      category: 'BREATHING'
    },
    'breathing-absent-abnormal': {
      text: 'b. Absent/abnormal breathing:',
      compulsory: true,
      category: 'BREATHING'
    },
    'breathing-2-initial-rescue-breaths': {
      text: 'i. Give 2 initial rescue breaths',
      compulsory: true,
      category: 'BREATHING'
    },
    'breathing-duration-1-second': {
      text: 'ii. Duration of delivering a breath is about 1 second',
      compulsory: true,
      category: 'BREATHING'
    },
    'breathing-visible-chest-rise': {
      text: 'iii. Sufficient to produce a visible chest rise',
      compulsory: true,
      category: 'BREATHING'
    },
    'circulation-assess-circulation': {
      text: 'i. a. Assess the circulation: Look for signs of life',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-carotid-pulse-10-seconds': {
      text: 'i. b. If trained, feel for a carotid pulse for not more than 10 seconds',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-start-compression-no-signs': {
      text: 'ii. Start chest compression if there are no signs of life',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-start-compression-pulse-less-60': {
      text: 'iii. Or if the pulse rate is less than 60 beats/min',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-one-rescuer-heel-one-hand': {
      text: 'i. For one rescuer CPR: The rescuer compresses with the heel of one hand',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-two-rescuers-heel-two-hands': {
      text: 'ii. For two rescuers CPR: The rescuer compresses with the heel of two hands',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-site-center-chest': {
      text: 'i. Site: Center of the chest (lower half of the sternum)',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-depth-5-6cm': {
      text: 'ii. Depth: At least 5-6 cm (2-2.4 inches)',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-rate-100-120-per-min': {
      text: 'iii. Rate: 100-120 compressions per minute',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-ratio-30-2': {
      text: 'iv. Ratio: 30 compressions to 2 breaths',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-recovery-position-lateral': {
      text: 'v. Recovery position (lateral)',
      compulsory: false,
      category: 'CIRCULATION'
    }
  },

  'two-man-cpr': {
    'danger-ppe': {
      text: 'Wear PPE (gloves, apron, mask), look out for blood spills, sharps, electric wires, Unsteady beds, trolley',
      compulsory: false,
      category: 'DANGER'
    },
    'response-tap-shoulders': {
      text: 'a. Tap shoulders',
      compulsory: false,
      category: 'RESPONSE'
    },
    'response-shout-call-adult': {
      text: 'b. Shout & speak "CALL THE ADULT"',
      compulsory: false,
      category: 'RESPONSE'
    },
    'shout-emergency': {
      text: 'a. For IHCA - Shout "Emergency! Emergency! Bring the resuscitation trolley and defibrillator/AED!"',
      compulsory: false,
      category: 'SHOUT FOR HELP'
    },
    'airway-head-tilt-chin-lift': {
      text: 'a. Head Tilt Chin Lift',
      compulsory: true,
      category: 'AIRWAY'
    },
    'airway-jaw-thrust': {
      text: 'b. Jaw Thrust (Trauma)',
      compulsory: false,
      category: 'AIRWAY'
    },
    'breathing-look-normal-breathing': {
      text: 'a. Look for normal breathing, which should not take more than 10 seconds',
      compulsory: true,
      category: 'BREATHING'
    },
    'breathing-absent-abnormal': {
      text: 'b. Absent/abnormal breathing:',
      compulsory: true,
      category: 'BREATHING'
    },
    'breathing-2-initial-rescue-breaths': {
      text: 'i. Give 2 initial rescue breaths',
      compulsory: true,
      category: 'BREATHING'
    },
    'breathing-duration-1-second': {
      text: 'ii. Duration of delivering a breath is about 1 second',
      compulsory: true,
      category: 'BREATHING'
    },
    'breathing-visible-chest-rise': {
      text: 'iii. Sufficient to produce a visible chest rise',
      compulsory: true,
      category: 'BREATHING'
    },
    'circulation-assess-circulation': {
      text: 'i. a. Assess the circulation: Look for signs of life',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-carotid-pulse-10-seconds': {
      text: 'i. b. If trained, feel for a carotid pulse for not more than 10 seconds',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-start-compression-no-signs': {
      text: 'ii. Start chest compression if there are no signs of life',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-start-compression-pulse-less-60': {
      text: 'iii. Or if the pulse rate is less than 60 beats/min',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-two-rescuers-heel-two-hands': {
      text: 'i. For two rescuers CPR: The rescuer compresses with the heel of two hands',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-site-center-chest': {
      text: 'i. Site: Center of the chest (lower half of the sternum)',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-depth-5-6cm': {
      text: 'ii. Depth: At least 5-6 cm (2-2.4 inches)',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-rate-100-120-per-min': {
      text: 'iii. Rate: 100-120 compressions per minute',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-ratio-30-2': {
      text: 'iv. Ratio: 30 compressions to 2 breaths',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-recovery-position-lateral': {
      text: 'v. Recovery position (lateral)',
      compulsory: false,
      category: 'CIRCULATION'
    }
  },

  'infant-cpr': {
    'danger-ppe': {
      text: 'Wear PPE (gloves, apron, mask), look out for blood spills, sharps, electric wires, Unsteady beds, trolley',
      compulsory: false,
      category: 'DANGER'
    },
    'response-tap-soles': {
      text: 'a. Tap baby soles',
      compulsory: false,
      category: 'RESPONSE'
    },
    'response-shout-call-infant': {
      text: 'b. Shout & speak "CALL THE INFANT"',
      compulsory: false,
      category: 'RESPONSE'
    },
    'shout-emergency': {
      text: 'a. For IHCA - Shout "Emergency! Emergency! Bring the resuscitation trolley and defibrillator/AED!"',
      compulsory: false,
      category: 'SHOUT FOR HELP'
    },
    'airway-head-tilt-chin-lift': {
      text: 'a. Head Tilt Chin Lift',
      compulsory: true,
      category: 'AIRWAY'
    },
    'airway-jaw-thrust': {
      text: 'b. Jaw Thrust (Trauma)',
      compulsory: false,
      category: 'AIRWAY'
    },
    'breathing-look-normal-breathing': {
      text: 'a. Look for normal breathing, which should not take more than 10 seconds',
      compulsory: true,
      category: 'BREATHING'
    },
    'breathing-absent-abnormal': {
      text: 'b. Absent/abnormal breathing:',
      compulsory: true,
      category: 'BREATHING'
    },
    'breathing-5-initial-rescue-breaths': {
      text: 'i. Give 5 initial rescue breaths',
      compulsory: true,
      category: 'BREATHING'
    },
    'breathing-duration-1-second': {
      text: 'ii. Duration of delivering a breath is about 1 second',
      compulsory: true,
      category: 'BREATHING'
    },
    'breathing-visible-chest-rise': {
      text: 'iii. Sufficient to produce a visible chest rise',
      compulsory: true,
      category: 'BREATHING'
    },
    'circulation-assess-circulation': {
      text: 'i. a. Assess the circulation: Look for signs of life',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-brachial-pulse-10-seconds': {
      text: 'i. b. If trained, feel for a brachial pulse for not more than 10 seconds',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-start-compression-no-signs': {
      text: 'ii. Start chest compression if there are no signs of life',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-start-compression-pulse-less-60': {
      text: 'iii. Or if the pulse rate is less than 60 beats/min',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-one-rescuer-2-fingers': {
      text: 'i. For one rescuer CPR: The rescuer compresses with the tips of 2 fingers',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-two-rescuers-two-thumbs': {
      text: 'ii. For two rescuers CPR: The rescuer compresses with the tips of two thumbs',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-site-lower-half-sternum': {
      text: 'i. Site: Lower half of the sternum',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-depth-1-3-chest-4cm': {
      text: 'ii. Depth: At least 1/3 of the chest depth (about 4 cm)',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-rate-100-120-per-min': {
      text: 'iii. Rate: 100-120 compressions per minute',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-ratio-15-2': {
      text: 'iv. Ratio: 15 compressions to 2 breaths',
      compulsory: true,
      category: 'CIRCULATION'
    },
    'circulation-recovery-position-lateral': {
      text: 'v. Recovery position (lateral)',
      compulsory: false,
      category: 'CIRCULATION'
    }
  },

  'adult-choking': {
    'assess-mild-coughing-effectively': {
      text: 'a. Mild airway obstruction: Coughing effectively',
      compulsory: false,
      category: 'ASSESS SEVERITY'
    },
    'assess-mild-fully-responsive': {
      text: 'b. Fully responsive',
      compulsory: false,
      category: 'ASSESS SEVERITY'
    },
    'assess-mild-loud-cough': {
      text: 'c. Loud cough',
      compulsory: false,
      category: 'ASSESS SEVERITY'
    },
    'assess-mild-taking-breath-before-coughing': {
      text: 'd. Taking a breath before coughing',
      compulsory: false,
      category: 'ASSESS SEVERITY'
    },
    'assess-mild-still-crying-speaking': {
      text: 'e. Still crying or speaking',
      compulsory: false,
      category: 'ASSESS SEVERITY'
    },
    'assess-severe-ineffective-cough': {
      text: 'a. Severe airway obstruction: Ineffective cough',
      compulsory: false,
      category: 'ASSESS SEVERITY'
    },
    'assess-severe-inability-to-cough': {
      text: 'b. Inability to cough',
      compulsory: false,
      category: 'ASSESS SEVERITY'
    },
    'assess-severe-decreasing-consciousness': {
      text: 'c. Decreasing consciousness',
      compulsory: false,
      category: 'ASSESS SEVERITY'
    },
    'assess-severe-inability-breathe-vocalise': {
      text: 'd. Inability to breathe or vocalise',
      compulsory: false,
      category: 'ASSESS SEVERITY'
    },
    'assess-severe-cyanosis': {
      text: 'e. Cyanosis',
      compulsory: false,
      category: 'ASSESS SEVERITY'
    },
    'mild-encourage-cough-monitor': {
      text: 'Encourage coughing and monitor',
      compulsory: false,
      category: 'MILD AIRWAY OBSTRUCTION'
    },
    'severe-ask-for-help': {
      text: 'Ask for help',
      compulsory: true,
      category: 'SEVERE AIRWAY OBSTRUCTION'
    },
    'severe-second-rescuer-call-mers': {
      text: 'a. If second rescuer is available, call MERS 999',
      compulsory: true,
      category: 'SEVERE AIRWAY OBSTRUCTION'
    },
    'severe-mobile-phone-speaker': {
      text: 'b. Use mobile phone on speaker mode',
      compulsory: true,
      category: 'SEVERE AIRWAY OBSTRUCTION'
    },
    'severe-single-rescuer-proceed': {
      text: 'c. If single rescuer, proceed with back blows and chest thrusts',
      compulsory: true,
      category: 'SEVERE AIRWAY OBSTRUCTION'
    },
    'severe-single-rescuer-call-simultaneously': {
      text: 'd. Call MERS 999 simultaneously',
      compulsory: true,
      category: 'SEVERE AIRWAY OBSTRUCTION'
    },
    'severe-perform-5-back-blows': {
      text: 'Perform 5 back blows',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-perform-5-chest-thrusts': {
      text: 'Perform 5 chest thrusts',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-back-blows-support-adult': {
      text: 'a. Support the adult with one hand',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-back-blows-bend-forward': {
      text: 'b. Bend the adult forward',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-back-blows-heel-between-shoulder-blades': {
      text: 'c. Use the heel of the other hand to strike between the shoulder blades',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-chest-thrust-stand-behind': {
      text: 'a. Stand behind the adult',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-chest-thrust-arms-around-waist': {
      text: 'b. Place your arms around the waist',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-chest-thrust-make-fist': {
      text: 'c. Make a fist with one hand',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-chest-thrust-place-above-navel': {
      text: 'd. Place the thumb side of the fist above the navel',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-chest-thrust-grasp-fist': {
      text: 'e. Grasp the fist with the other hand',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-chest-thrust-press-inward-upward': {
      text: 'f. Press inward and upward',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-continue-sequence-foreign-body': {
      text: 'Continue the sequence until the foreign body is expelled',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-continue-sequence-still-conscious': {
      text: 'Continue the sequence as long as the adult is still conscious',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'unconscious-start-cpr': {
      text: 'If the adult becomes unconscious, start CPR',
      compulsory: true,
      category: 'VICTIM UNCONSCIOUS'
    },
    'unconscious-check-foreign-body': {
      text: 'Check for foreign body in the mouth',
      compulsory: true,
      category: 'VICTIM UNCONSCIOUS'
    },
    'unconscious-no-blind-finger-sweep': {
      text: 'Do not perform blind finger sweep',
      compulsory: true,
      category: 'VICTIM UNCONSCIOUS'
    }
  },

  'infant-choking': {
    'assess-mild-coughing-effectively': {
      text: 'a. Mild airway obstruction: Coughing effectively',
      compulsory: false,
      category: 'ASSESS SEVERITY'
    },
    'assess-mild-fully-responsive': {
      text: 'b. Fully responsive',
      compulsory: false,
      category: 'ASSESS SEVERITY'
    },
    'assess-mild-loud-cough': {
      text: 'c. Loud cough',
      compulsory: false,
      category: 'ASSESS SEVERITY'
    },
    'assess-mild-taking-breath-before-coughing': {
      text: 'd. Taking a breath before coughing',
      compulsory: false,
      category: 'ASSESS SEVERITY'
    },
    'assess-mild-still-crying-speaking': {
      text: 'e. Still crying or speaking',
      compulsory: false,
      category: 'ASSESS SEVERITY'
    },
    'assess-severe-ineffective-cough': {
      text: 'a. Severe airway obstruction: Ineffective cough',
      compulsory: false,
      category: 'ASSESS SEVERITY'
    },
    'assess-severe-inability-to-cough': {
      text: 'b. Inability to cough',
      compulsory: false,
      category: 'ASSESS SEVERITY'
    },
    'assess-severe-decreasing-consciousness': {
      text: 'c. Decreasing consciousness',
      compulsory: false,
      category: 'ASSESS SEVERITY'
    },
    'assess-severe-inability-breathe-vocalise': {
      text: 'd. Inability to breathe or vocalise',
      compulsory: false,
      category: 'ASSESS SEVERITY'
    },
    'assess-severe-cyanosis': {
      text: 'e. Cyanosis',
      compulsory: false,
      category: 'ASSESS SEVERITY'
    },
    'mild-encourage-cough-monitor': {
      text: 'Encourage coughing and monitor',
      compulsory: false,
      category: 'MILD AIRWAY OBSTRUCTION'
    },
    'severe-ask-for-help': {
      text: 'Ask for help',
      compulsory: true,
      category: 'SEVERE AIRWAY OBSTRUCTION'
    },
    'severe-second-rescuer-call-mers': {
      text: 'a. If second rescuer is available, call MERS 999',
      compulsory: true,
      category: 'SEVERE AIRWAY OBSTRUCTION'
    },
    'severe-mobile-phone-speaker': {
      text: 'b. Use mobile phone on speaker mode',
      compulsory: true,
      category: 'SEVERE AIRWAY OBSTRUCTION'
    },
    'severe-single-rescuer-proceed': {
      text: 'c. If single rescuer, proceed with back blows and chest thrusts',
      compulsory: true,
      category: 'SEVERE AIRWAY OBSTRUCTION'
    },
    'severe-single-rescuer-call-simultaneously': {
      text: 'd. Call MERS 999 simultaneously',
      compulsory: true,
      category: 'SEVERE AIRWAY OBSTRUCTION'
    },
    'severe-perform-5-back-blows': {
      text: 'Perform 5 back blows',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-perform-5-chest-thrusts': {
      text: 'Perform 5 chest thrusts',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-back-blows-support-infant': {
      text: 'a. Support the infant with one hand',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-back-blows-head-downwards-prone': {
      text: 'b. Hold the infant head downwards in prone position',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-back-blows-thumb-angle-lower-jaw': {
      text: 'c. Use the thumb and index finger to angle the lower jaw',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-back-blows-heel-middle-back': {
      text: 'd. Use the heel of the other hand to strike the middle of the back',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-back-blows-between-shoulder-blades': {
      text: 'e. Between the shoulder blades',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-chest-thrust-turn-supine': {
      text: 'a. Turn the infant to supine position',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-chest-thrust-head-downwards-supine': {
      text: 'b. Hold the infant head downwards in supine position',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-chest-thrust-free-arm-along-back': {
      text: 'c. Use the free arm along the back',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-chest-thrust-encircle-occiput': {
      text: 'd. Encircle the occiput',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-chest-thrust-identify-landmark': {
      text: 'e. Identify the landmark',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-chest-thrust-lower-sternum': {
      text: 'f. Lower sternum',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-chest-thrust-finger-breadth-above-xiphisternum': {
      text: 'g. One finger breadth above the xiphisternum',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-continue-sequence-foreign-body': {
      text: 'Continue the sequence until the foreign body is expelled',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'severe-continue-sequence-still-conscious': {
      text: 'Continue the sequence as long as the infant is still conscious',
      compulsory: true,
      category: 'BACK BLOWS AND CHEST THRUSTS'
    },
    'unconscious-start-cpr': {
      text: 'If the infant becomes unconscious, start CPR',
      compulsory: true,
      category: 'VICTIM UNCONSCIOUS'
    },
    'unconscious-check-foreign-body': {
      text: 'Check for foreign body in the mouth',
      compulsory: true,
      category: 'VICTIM UNCONSCIOUS'
    },
    'unconscious-no-blind-finger-sweep': {
      text: 'Do not perform blind finger sweep',
      compulsory: true,
      category: 'VICTIM UNCONSCIOUS'
    }
  }
};

async function uploadChecklistItems() {
  try {
    console.log('🚀 Starting checklist items upload to Supabase...\n');
    
    let totalItems = 0;
    let uploadedItems = 0;
    
    // Process each station
    for (const [stationId, items] of Object.entries(checklistData)) {
      console.log(`📋 Processing ${stationId}...`);
      
      const itemsToUpload = Object.entries(items).map(([itemId, itemData]) => ({
        id: `${stationId}-${itemId}`,
        station_id: stationId,
        item_id: itemId,
        text: itemData.text,
        compulsory: itemData.compulsory,
        category: itemData.category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      totalItems += itemsToUpload.length;
      
      // Upload items for this station
      const { data, error } = await supabase
        .from('checklist_items')
        .upsert(itemsToUpload, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`❌ Error uploading ${stationId}:`, error);
      } else {
        uploadedItems += itemsToUpload.length;
        console.log(`✅ Uploaded ${itemsToUpload.length} items for ${stationId}`);
      }
    }
    
    console.log(`\n🎉 Upload complete!`);
    console.log(`📊 Total items processed: ${totalItems}`);
    console.log(`✅ Successfully uploaded: ${uploadedItems}`);
    
    // Verify upload
    console.log('\n🔍 Verifying upload...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('checklist_items')
      .select('station_id')
      .order('station_id');
    
    if (verifyError) {
      console.error('❌ Error verifying upload:', verifyError);
    } else {
      // Count items per station
      const stationCounts = {};
      verifyData.forEach(row => {
        stationCounts[row.station_id] = (stationCounts[row.station_id] || 0) + 1;
      });
      
      console.log('📈 Items per station:');
      Object.entries(stationCounts).forEach(([station, count]) => {
        console.log(`   ${station}: ${count} items`);
      });
    }
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
  }
}

// Run the upload
uploadChecklistItems();
