// replaceAllChecklistDetails.js
// Replace ALL checklist_details in checklist_results table with fresh data from checklist_items

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E'
);

async function replaceAllChecklistDetails() {
  try {
    console.log('🚀 Starting complete checklist_details replacement...\n');
    
    // First, get all checklist results
    console.log('1. Fetching all checklist results...');
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
    
    console.log('\n3. Processing ALL checklist results (replacing existing data)...');
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const result of results) {
      const checklistType = result.checklist_type;
      
      // Get checklist items for this station
      const stationItems = itemsByStation[checklistType] || [];
      
      if (stationItems.length === 0) {
        console.log(`⚠️  No checklist items found for ${checklistType} - skipping ${result.id}`);
        errorCount++;
        continue;
      }
      
      // Create fresh checklist_details object
      const checklistDetails = {};
      stationItems.forEach(item => {
        checklistDetails[item.item_id] = {
          text: item.text,
          compulsory: item.compulsory,
          category: item.category,
          completed: false // Default to false, will be updated based on actual performance
        };
      });
      
      // Force update the checklist_results record (replace existing data)
      const { error: updateError } = await supabase
        .from('checklist_results')
        .update({ 
          checklist_details: checklistDetails,
          updated_at: new Date().toISOString()
        })
        .eq('id', result.id);
      
      if (updateError) {
        console.error(`❌ Error updating ${result.id}:`, updateError);
        errorCount++;
      } else {
        console.log(`✅ Replaced ${result.id} (${checklistType}) with ${stationItems.length} items`);
        updatedCount++;
      }
    }
    
    console.log(`\n🎉 Replacement complete!`);
    console.log(`📊 Total results processed: ${results.length}`);
    console.log(`✅ Successfully updated: ${updatedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    // Verify the update
    console.log('\n🔍 Verifying updates...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('checklist_results')
      .select('id, checklist_type, checklist_details')
      .not('checklist_details', 'is', null)
      .limit(10);
    
    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError);
    } else {
      console.log('📈 Sample updated records:');
      verifyData.forEach((record, index) => {
        const detailsCount = Object.keys(record.checklist_details || {}).length;
        console.log(`   ${index + 1}. ${record.id} (${record.checklist_type}): ${detailsCount} items`);
      });
    }
    
    // Show breakdown by station type
    console.log('\n📊 Breakdown by station type:');
    const stationCounts = {};
    results.forEach(result => {
      const stationItems = itemsByStation[result.checklist_type] || [];
      stationCounts[result.checklist_type] = (stationCounts[result.checklist_type] || 0) + 1;
    });
    
    Object.entries(stationCounts).forEach(([station, count]) => {
      const itemCount = itemsByStation[station]?.length || 0;
      console.log(`   ${station}: ${count} results with ${itemCount} items each`);
    });
    
  } catch (error) {
    console.error('❌ Replacement failed:', error);
  }
}

// Run the replacement
replaceAllChecklistDetails();
