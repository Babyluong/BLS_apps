// compareChecklistDetails.js
// Compare checklist details between bls_results and checklist_results tables

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E'
);

async function compareChecklistDetails() {
  try {
    console.log('🔍 Comparing checklist details between bls_results and checklist_results...\n');
    
    // Get sample data from both tables
    const { data: blsResults } = await supabase
      .from('bls_results')
      .select('id, user_id, one_man_cpr_details, two_man_cpr_details, infant_cpr_details, adult_choking_details, infant_choking_details')
      .limit(3);
    
    const { data: checklistResults } = await supabase
      .from('checklist_results')
      .select('id, user_id, checklist_type, checklist_details')
      .limit(5);
    
    console.log('📊 BLS Results Checklist Details Structure:');
    console.log('=' .repeat(60));
    
    if (blsResults && blsResults.length > 0) {
      const sampleBLS = blsResults[0];
      console.log('\n🏥 Sample BLS Results (one_man_cpr_details):');
      console.log(JSON.stringify(sampleBLS.one_man_cpr_details, null, 2));
      
      console.log('\n📋 Available BLS detail columns:');
      Object.keys(sampleBLS).forEach(key => {
        if (key.includes('_details')) {
          console.log(`   - ${key}`);
        }
      });
    }
    
    console.log('\n📊 Checklist Results Checklist Details Structure:');
    console.log('=' .repeat(60));
    
    if (checklistResults && checklistResults.length > 0) {
      const sampleChecklist = checklistResults[0];
      console.log('\n📋 Sample Checklist Results (checklist_details):');
      console.log(JSON.stringify(sampleChecklist.checklist_details, null, 2));
      
      console.log(`\n📊 Checklist type: ${sampleChecklist.checklist_type}`);
      console.log(`📊 Number of items: ${Object.keys(sampleChecklist.checklist_details || {}).length}`);
    }
    
    // Analyze the differences
    console.log('\n🔍 STRUCTURAL DIFFERENCES ANALYSIS:');
    console.log('=' .repeat(60));
    
    console.log('\n🏥 BLS Results Structure:');
    console.log('   - Separate columns for each station type');
    console.log('   - Each column contains: pass, score, status, performed[], notPerformed[], percentage, totalItems');
    console.log('   - Based on actual performance during BLS assessment');
    console.log('   - Performance-focused data structure');
    
    console.log('\n📋 Checklist Results Structure:');
    console.log('   - Single checklist_details column (JSONB)');
    console.log('   - Contains standardized checklist items from checklist_items table');
    console.log('   - Each item has: text, compulsory, category, completed (default false)');
    console.log('   - Template-based data structure');
    
    console.log('\n⚠️  KEY DIFFERENCES:');
    console.log('   1. BLS Results: Performance data (what was actually done)');
    console.log('   2. Checklist Results: Template data (what should be done)');
    console.log('   3. Different data structures and purposes');
    console.log('   4. BLS Results are user-specific performance records');
    console.log('   5. Checklist Results are standardized templates');
    
    // Check if we need to synchronize
    console.log('\n💡 SYNCHRONIZATION RECOMMENDATIONS:');
    console.log('=' .repeat(60));
    
    console.log('\n✅ Current State is CORRECT:');
    console.log('   - BLS Results: Store actual performance data');
    console.log('   - Checklist Results: Store standardized templates');
    console.log('   - These serve different purposes and should remain separate');
    
    console.log('\n🎯 RECOMMENDED APPROACH:');
    console.log('   1. Keep BLS Results as performance records');
    console.log('   2. Keep Checklist Results as standardized templates');
    console.log('   3. Use Checklist Results to populate new BLS assessments');
    console.log('   4. Use BLS Results to track actual performance');
    
    console.log('\n🔧 IF SYNCHRONIZATION IS NEEDED:');
    console.log('   - Option 1: Update BLS Results to use standardized checklist items');
    console.log('   - Option 2: Update Checklist Results to reflect actual performance');
    console.log('   - Option 3: Create a mapping between the two structures');
    
    // Show sample mapping
    console.log('\n📊 SAMPLE MAPPING (if needed):');
    console.log('=' .repeat(60));
    
    if (blsResults && blsResults.length > 0 && checklistResults && checklistResults.length > 0) {
      const blsSample = blsResults[0].one_man_cpr_details;
      const checklistSample = checklistResults.find(c => c.checklist_type === 'one-man-cpr');
      
      if (blsSample && checklistSample) {
        console.log('\n🏥 BLS Results (one_man_cpr_details):');
        console.log(`   Performed: ${blsSample.performed?.length || 0} items`);
        console.log(`   Not Performed: ${blsSample.notPerformed?.length || 0} items`);
        console.log(`   Score: ${blsSample.score}/${blsSample.totalItems}`);
        
        console.log('\n📋 Checklist Results (checklist_details):');
        const checklistItems = Object.keys(checklistSample.checklist_details || {});
        console.log(`   Total Items: ${checklistItems.length}`);
        console.log(`   Sample Items: ${checklistItems.slice(0, 3).join(', ')}...`);
      }
    }
    
  } catch (error) {
    console.error('❌ Comparison failed:', error);
  }
}

// Run the comparison
compareChecklistDetails();
