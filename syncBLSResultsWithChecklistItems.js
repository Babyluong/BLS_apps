// syncBLSResultsWithChecklistItems.js
// Synchronize BLS results to use standardized checklist items from checklist_items table

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E'
);

async function syncBLSResultsWithChecklistItems() {
  try {
    console.log('🔄 Synchronizing BLS Results with standardized checklist items...\n');
    
    // 1. Get all checklist items organized by station
    console.log('1. 📋 Fetching standardized checklist items...');
    const { data: checklistItems, error: itemsError } = await supabase
      .from('checklist_items')
      .select('*')
      .order('station_id, item_id');
    
    if (itemsError) {
      console.error('❌ Error fetching checklist items:', itemsError);
      return;
    }
    
    console.log(`   📊 Found ${checklistItems.length} checklist items`);
    
    // Organize items by station_id
    const itemsByStation = {};
    checklistItems.forEach(item => {
      if (!itemsByStation[item.station_id]) {
        itemsByStation[item.station_id] = [];
      }
      itemsByStation[item.station_id].push(item);
    });
    
    console.log('   📋 Items by station:');
    Object.entries(itemsByStation).forEach(([station, items]) => {
      console.log(`      ${station}: ${items.length} items`);
    });
    
    // 2. Get all BLS results
    console.log('\n2. 🏥 Fetching BLS results...');
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('id, user_id, one_man_cpr_details, two_man_cpr_details, infant_cpr_details, adult_choking_details, infant_choking_details')
      .order('created_at', { ascending: true });
    
    if (blsError) {
      console.error('❌ Error fetching BLS results:', blsError);
      return;
    }
    
    console.log(`   📊 Found ${blsResults.length} BLS results to update`);
    
    // 3. Create mapping from old item names to new standardized items
    console.log('\n3. 🔗 Creating item mapping...');
    
    const itemMappings = {
      'one-man-cpr': {
        'Scene safety assessment': 'scene-safety-assessment',
        'Check responsiveness': 'check-responsiveness',
        'Call for help': 'call-for-help',
        'Open airway': 'open-airway',
        'Check breathing': 'check-breathing',
        'Check pulse': 'check-pulse',
        'Begin compressions': 'begin-compressions',
        'Proper hand placement': 'proper-hand-placement',
        'Correct compression depth': 'correct-compression-depth',
        'Correct compression rate': 'correct-compression-rate',
        'Allow full chest recoil': 'allow-full-chest-recoil',
        'Minimize interruptions': 'minimize-interruptions',
        'Rescue breaths (if applicable)': 'rescue-breaths-if-applicable',
        'AED use (if applicable)': 'aed-use-if-applicable',
        'Reassessment': 'reassessment'
      },
      'two-man-cpr': {
        'Scene safety assessment': 'scene-safety-assessment',
        'Check responsiveness': 'check-responsiveness',
        'Call for help': 'call-for-help',
        'Open airway': 'open-airway',
        'Check breathing': 'check-breathing',
        'Check pulse': 'check-pulse',
        'Begin compressions': 'begin-compressions',
        'Proper hand placement': 'proper-hand-placement',
        'Correct compression depth': 'correct-compression-depth',
        'Correct compression rate': 'correct-compression-rate',
        'Allow full chest recoil': 'allow-full-chest-recoil',
        'Minimize interruptions': 'minimize-interruptions',
        'Rescue breaths (if applicable)': 'rescue-breaths-if-applicable',
        'AED use (if applicable)': 'aed-use-if-applicable',
        'Reassessment': 'reassessment'
      },
      'infant-cpr': {
        'Scene safety assessment': 'scene-safety-assessment',
        'Check responsiveness': 'check-responsiveness',
        'Call for help': 'call-for-help',
        'Open airway': 'open-airway',
        'Check breathing': 'check-breathing',
        'Check pulse': 'check-pulse',
        'Begin compressions': 'begin-compressions',
        'Proper hand placement': 'proper-hand-placement',
        'Correct compression depth': 'correct-compression-depth',
        'Correct compression rate': 'correct-compression-rate',
        'Allow full chest recoil': 'allow-full-chest-recoil',
        'Minimize interruptions': 'minimize-interruptions',
        'Rescue breaths (if applicable)': 'rescue-breaths-if-applicable',
        'AED use (if applicable)': 'aed-use-if-applicable',
        'Reassessment': 'reassessment'
      },
      'adult-choking': {
        'Scene safety assessment': 'scene-safety-assessment',
        'Check responsiveness': 'check-responsiveness',
        'Call for help': 'call-for-help',
        'Open airway': 'open-airway',
        'Check breathing': 'check-breathing',
        'Check pulse': 'check-pulse',
        'Begin compressions': 'begin-compressions',
        'Proper hand placement': 'proper-hand-placement',
        'Correct compression depth': 'correct-compression-depth',
        'Correct compression rate': 'correct-compression-rate',
        'Allow full chest recoil': 'allow-full-chest-recoil',
        'Minimize interruptions': 'minimize-interruptions',
        'Rescue breaths (if applicable)': 'rescue-breaths-if-applicable',
        'AED use (if applicable)': 'aed-use-if-applicable',
        'Reassessment': 'reassessment'
      },
      'infant-choking': {
        'Scene safety assessment': 'scene-safety-assessment',
        'Check responsiveness': 'check-responsiveness',
        'Call for help': 'call-for-help',
        'Open airway': 'open-airway',
        'Check breathing': 'check-breathing',
        'Check pulse': 'check-pulse',
        'Begin compressions': 'begin-compressions',
        'Proper hand placement': 'proper-hand-placement',
        'Correct compression depth': 'correct-compression-depth',
        'Correct compression rate': 'correct-compression-rate',
        'Allow full chest recoil': 'allow-full-chest-recoil',
        'Minimize interruptions': 'minimize-interruptions',
        'Rescue breaths (if applicable)': 'rescue-breaths-if-applicable',
        'AED use (if applicable)': 'aed-use-if-applicable',
        'Reassessment': 'reassessment'
      }
    };
    
    // 4. Update each BLS result
    console.log('\n4. 🔄 Updating BLS results with standardized checklist items...');
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const blsResult of blsResults) {
      try {
        const updates = {};
        
        // Update each station's details
        const stationMappings = {
          'one_man_cpr_details': 'one-man-cpr',
          'two_man_cpr_details': 'two-man-cpr',
          'infant_cpr_details': 'infant-cpr',
          'adult_choking_details': 'adult-choking',
          'infant_choking_details': 'infant-choking'
        };
        
        for (const [detailColumn, stationId] of Object.entries(stationMappings)) {
          const oldDetails = blsResult[detailColumn];
          if (oldDetails && oldDetails.performed && oldDetails.notPerformed) {
            // Get standardized items for this station
            const stationItems = itemsByStation[stationId] || [];
            
            // Create new standardized details
            const newDetails = {
              pass: oldDetails.pass,
              score: oldDetails.score,
              status: oldDetails.status,
              percentage: oldDetails.percentage,
              totalItems: oldDetails.totalItems,
              performed: [],
              notPerformed: [],
              standardized_items: {}
            };
            
            // Map performed items
            oldDetails.performed.forEach(itemName => {
              const mappedItemId = itemMappings[stationId]?.[itemName];
              if (mappedItemId) {
                newDetails.performed.push(mappedItemId);
                // Find the standardized item details
                const standardizedItem = stationItems.find(item => item.item_id === mappedItemId);
                if (standardizedItem) {
                  newDetails.standardized_items[mappedItemId] = {
                    text: standardizedItem.text,
                    compulsory: standardizedItem.compulsory,
                    category: standardizedItem.category,
                    completed: true
                  };
                }
              }
            });
            
            // Map not performed items
            oldDetails.notPerformed.forEach(itemName => {
              const mappedItemId = itemMappings[stationId]?.[itemName];
              if (mappedItemId) {
                newDetails.notPerformed.push(mappedItemId);
                // Find the standardized item details
                const standardizedItem = stationItems.find(item => item.item_id === mappedItemId);
                if (standardizedItem) {
                  newDetails.standardized_items[mappedItemId] = {
                    text: standardizedItem.text,
                    compulsory: standardizedItem.compulsory,
                    category: standardizedItem.category,
                    completed: false
                  };
                }
              }
            });
            
            // Add any missing items from the standardized list
            stationItems.forEach(item => {
              if (!newDetails.standardized_items[item.item_id]) {
                newDetails.standardized_items[item.item_id] = {
                  text: item.text,
                  compulsory: item.compulsory,
                  category: item.category,
                  completed: false
                };
                newDetails.notPerformed.push(item.item_id);
              }
            });
            
            updates[detailColumn] = newDetails;
          }
        }
        
        // Update the BLS result
        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('bls_results')
            .update(updates)
            .eq('id', blsResult.id);
          
          if (updateError) {
            console.error(`❌ Error updating ${blsResult.id}:`, updateError);
            errorCount++;
          } else {
            console.log(`✅ Updated ${blsResult.id} with standardized items`);
            updatedCount++;
          }
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${blsResult.id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Synchronization complete!`);
    console.log(`📊 Total BLS results processed: ${blsResults.length}`);
    console.log(`✅ Successfully updated: ${updatedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    // 5. Verify the updates
    console.log('\n🔍 Verifying updates...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('bls_results')
      .select('id, one_man_cpr_details')
      .limit(3);
    
    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError);
    } else {
      console.log('📈 Sample updated BLS result:');
      if (verifyData && verifyData.length > 0) {
        const sample = verifyData[0].one_man_cpr_details;
        console.log(`   Performed: ${sample.performed?.length || 0} items`);
        console.log(`   Not Performed: ${sample.notPerformed?.length || 0} items`);
        console.log(`   Standardized Items: ${Object.keys(sample.standardized_items || {}).length} items`);
        console.log(`   Sample Item: ${Object.keys(sample.standardized_items || {})[0] || 'None'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Synchronization failed:', error);
  }
}

// Run the synchronization
syncBLSResultsWithChecklistItems();
