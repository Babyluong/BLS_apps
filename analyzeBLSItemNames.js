// analyzeBLSItemNames.js
// Analyze the actual item names used in BLS results to create proper mapping

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E'
);

async function analyzeBLSItemNames() {
  try {
    console.log('🔍 Analyzing BLS Results item names...\n');
    
    // Get sample BLS results
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('id, one_man_cpr_details, two_man_cpr_details, infant_cpr_details, adult_choking_details, infant_choking_details')
      .limit(5);
    
    if (blsError) {
      console.error('❌ Error fetching BLS results:', blsError);
      return;
    }
    
    console.log('📊 Analyzing item names across all stations...\n');
    
    const allItemNames = new Set();
    const stationItemNames = {};
    
    const stationColumns = {
      'one_man_cpr_details': 'One Man CPR',
      'two_man_cpr_details': 'Two Man CPR', 
      'infant_cpr_details': 'Infant CPR',
      'adult_choking_details': 'Adult Choking',
      'infant_choking_details': 'Infant Choking'
    };
    
    Object.entries(stationColumns).forEach(([column, stationName]) => {
      stationItemNames[stationName] = new Set();
      
      blsResults.forEach(result => {
        const details = result[column];
        if (details && details.performed) {
          details.performed.forEach(item => {
            allItemNames.add(item);
            stationItemNames[stationName].add(item);
          });
        }
        if (details && details.notPerformed) {
          details.notPerformed.forEach(item => {
            allItemNames.add(item);
            stationItemNames[stationName].add(item);
          });
        }
      });
    });
    
    console.log('📋 All unique item names found:');
    console.log('=' .repeat(50));
    [...allItemNames].sort().forEach((item, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. "${item}"`);
    });
    
    console.log(`\n📊 Total unique items: ${allItemNames.size}`);
    
    console.log('\n📋 Item names by station:');
    console.log('=' .repeat(50));
    Object.entries(stationItemNames).forEach(([station, items]) => {
      console.log(`\n🏥 ${station}:`);
      [...items].sort().forEach((item, index) => {
        console.log(`   ${(index + 1).toString().padStart(2)}. "${item}"`);
      });
      console.log(`   Total: ${items.size} items`);
    });
    
    // Now get the standardized checklist items for comparison
    console.log('\n📋 Standardized checklist items:');
    console.log('=' .repeat(50));
    
    const { data: checklistItems, error: itemsError } = await supabase
      .from('checklist_items')
      .select('station_id, item_id, text')
      .order('station_id, item_id');
    
    if (itemsError) {
      console.error('❌ Error fetching checklist items:', itemsError);
      return;
    }
    
    const standardizedByStation = {};
    checklistItems.forEach(item => {
      if (!standardizedByStation[item.station_id]) {
        standardizedByStation[item.station_id] = [];
      }
      standardizedByStation[item.station_id].push({
        id: item.item_id,
        text: item.text
      });
    });
    
    Object.entries(standardizedByStation).forEach(([station, items]) => {
      console.log(`\n📋 ${station}:`);
      items.forEach((item, index) => {
        console.log(`   ${(index + 1).toString().padStart(2)}. ${item.id}: "${item.text}"`);
      });
      console.log(`   Total: ${items.length} items`);
    });
    
    // Show the mismatch
    console.log('\n⚠️  MISMATCH ANALYSIS:');
    console.log('=' .repeat(50));
    console.log('BLS Results use simple descriptive names like:');
    console.log('   - "Scene safety assessment"');
    console.log('   - "Check responsiveness"');
    console.log('   - "Call for help"');
    console.log('');
    console.log('Checklist Items use detailed IDs like:');
    console.log('   - "severe-ask-for-help"');
    console.log('   - "unconscious-start-cpr"');
    console.log('   - "assess-mild-loud-cough"');
    console.log('');
    console.log('💡 SOLUTION: We need to create a mapping between these two systems.');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

// Run the analysis
analyzeBLSItemNames();
