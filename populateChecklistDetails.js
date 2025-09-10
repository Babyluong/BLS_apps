// populateChecklistDetails.js
// Populate checklist_details column in checklist_results table with checklist_items data

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E'
);

async function populateChecklistDetails() {
  try {
    console.log('🚀 Starting checklist_details population...\n');
    
    // First, get all checklist results that need to be updated
    console.log('1. Fetching checklist results...');
    const { data: results, error: resultsError } = await supabase
      .from('checklist_results')
      .select('id, checklist_type, checklist_details')
      .order('created_at', { ascending: true });
    
    if (resultsError) {
      console.error('❌ Error fetching checklist results:', resultsError);
      return;
    }
    
    console.log(`📊 Found ${results.length} checklist results to process`);
    
    // Get all checklist items organized by station
    console.log('\n2. Fetching checklist items...');
    const { data: items, error: itemsError } = await supabase
      .from('checklist_items')
      .select('*')
      .order('station_id, item_id');
    
    if (itemsError) {
      console.error('❌ Error fetching checklist items:', itemsError);
      return;
    }
    
    console.log(`📋 Found ${items.length} checklist items`);
    
    // Organize items by station_id
    const itemsByStation = {};
    items.forEach(item => {
      if (!itemsByStation[item.station_id]) {
        itemsByStation[item.station_id] = [];
      }
      itemsByStation[item.station_id].push(item);
    });
    
    console.log('\n3. Processing checklist results...');
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const result of results) {
      const checklistType = result.checklist_type;
      
      // Check if this result already has checklist_details populated
      if (result.checklist_details && Object.keys(result.checklist_details).length > 0) {
        console.log(`⏭️  Skipping ${result.id} - already has checklist_details`);
        skippedCount++;
        continue;
      }
      
      // Get checklist items for this station
      const stationItems = itemsByStation[checklistType] || [];
      
      if (stationItems.length === 0) {
        console.log(`⚠️  No checklist items found for ${checklistType}`);
        continue;
      }
      
      // Create checklist_details object
      const checklistDetails = {};
      stationItems.forEach(item => {
        checklistDetails[item.item_id] = {
          text: item.text,
          compulsory: item.compulsory,
          category: item.category,
          completed: false // Default to false, will be updated based on actual performance
        };
      });
      
      // Update the checklist_results record
      const { error: updateError } = await supabase
        .from('checklist_results')
        .update({ 
          checklist_details: checklistDetails,
          updated_at: new Date().toISOString()
        })
        .eq('id', result.id);
      
      if (updateError) {
        console.error(`❌ Error updating ${result.id}:`, updateError);
      } else {
        console.log(`✅ Updated ${result.id} (${checklistType}) with ${stationItems.length} items`);
        updatedCount++;
      }
    }
    
    console.log(`\n🎉 Population complete!`);
    console.log(`📊 Total results processed: ${results.length}`);
    console.log(`✅ Successfully updated: ${updatedCount}`);
    console.log(`⏭️  Skipped (already populated): ${skippedCount}`);
    
    // Verify the update
    console.log('\n🔍 Verifying updates...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('checklist_results')
      .select('id, checklist_type, checklist_details')
      .not('checklist_details', 'is', null)
      .limit(5);
    
    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError);
    } else {
      console.log('📈 Sample updated records:');
      verifyData.forEach((record, index) => {
        const detailsCount = Object.keys(record.checklist_details || {}).length;
        console.log(`   ${index + 1}. ${record.id} (${record.checklist_type}): ${detailsCount} items`);
      });
    }
    
  } catch (error) {
    console.error('❌ Population failed:', error);
  }
}

// Run the population
populateChecklistDetails();