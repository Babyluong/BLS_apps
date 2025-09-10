// addCommentsToBLSResults.js
// Add comments column to bls_results and populate with data from checklist_results

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E'
);

async function addCommentsToBLSResults() {
  try {
    console.log('💬 Adding comments to BLS Results using data from checklist_results...\n');
    
    // 1. First, let's check if comments column already exists
    console.log('1. 🔍 Checking if comments column exists...');
    
    const { data: sampleBLS, error: sampleError } = await supabase
      .from('bls_results')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Error checking BLS results:', sampleError);
      return;
    }
    
    const hasCommentsColumn = sampleBLS && sampleBLS.length > 0 && 'comments' in sampleBLS[0];
    console.log(`   ${hasCommentsColumn ? '✅' : '❌'} Comments column ${hasCommentsColumn ? 'exists' : 'does not exist'}`);
    
    if (!hasCommentsColumn) {
      console.log('\n2. 📝 Creating comments column...');
      console.log('   Note: You may need to add the comments column manually in Supabase:');
      console.log('   ALTER TABLE bls_results ADD COLUMN comments TEXT;');
      console.log('   Or run this script after adding the column manually.');
      return;
    }
    
    // 2. Get all BLS results
    console.log('\n2. 🏥 Fetching BLS results...');
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('id, user_id, one_man_cpr_details, two_man_cpr_details, infant_cpr_details, adult_choking_details, infant_choking_details, comments')
      .order('created_at', { ascending: true });
    
    if (blsError) {
      console.error('❌ Error fetching BLS results:', blsError);
      return;
    }
    
    console.log(`   📊 Found ${blsResults.length} BLS results`);
    
    // 3. Get all checklist results organized by user and station
    console.log('\n3. 📋 Fetching checklist results...');
    const { data: checklistResults, error: checklistError } = await supabase
      .from('checklist_results')
      .select('id, user_id, checklist_type, checklist_details, comments')
      .order('created_at', { ascending: true });
    
    if (checklistError) {
      console.error('❌ Error fetching checklist results:', checklistError);
      return;
    }
    
    console.log(`   📊 Found ${checklistResults.length} checklist results`);
    
    // Organize checklist results by user and station
    const checklistByUser = {};
    checklistResults.forEach(result => {
      if (!checklistByUser[result.user_id]) {
        checklistByUser[result.user_id] = {};
      }
      checklistByUser[result.user_id][result.checklist_type] = result;
    });
    
    // 4. Generate comments for each BLS result
    console.log('\n4. 💬 Generating comments for BLS results...');
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const blsResult of blsResults) {
      try {
        const userId = blsResult.user_id;
        const userChecklists = checklistByUser[userId] || {};
        
        // Generate comprehensive comments
        const comments = [];
        
        // Add overall performance summary
        const stationResults = [];
        if (blsResult.one_man_cpr_details) {
          const cpr = blsResult.one_man_cpr_details;
          stationResults.push(`One Man CPR: ${cpr.status} (${cpr.score}/${cpr.totalItems})`);
        }
        if (blsResult.two_man_cpr_details) {
          const cpr = blsResult.two_man_cpr_details;
          stationResults.push(`Two Man CPR: ${cpr.status} (${cpr.score}/${cpr.totalItems})`);
        }
        if (blsResult.infant_cpr_details) {
          const cpr = blsResult.infant_cpr_details;
          stationResults.push(`Infant CPR: ${cpr.status} (${cpr.score}/${cpr.totalItems})`);
        }
        if (blsResult.adult_choking_details) {
          const choking = blsResult.adult_choking_details;
          stationResults.push(`Adult Choking: ${choking.status} (${choking.score}/${choking.totalItems})`);
        }
        if (blsResult.infant_choking_details) {
          const choking = blsResult.infant_choking_details;
          stationResults.push(`Infant Choking: ${choking.status} (${choking.score}/${choking.totalItems})`);
        }
        
        if (stationResults.length > 0) {
          comments.push(`PERFORMANCE SUMMARY: ${stationResults.join(', ')}`);
        }
        
        // Add detailed analysis for each station
        const stationMappings = {
          'one_man_cpr_details': 'one-man-cpr',
          'two_man_cpr_details': 'two-man-cpr',
          'infant_cpr_details': 'infant-cpr',
          'adult_choking_details': 'adult-choking',
          'infant_choking_details': 'infant-choking'
        };
        
        Object.entries(stationMappings).forEach(([detailColumn, stationType]) => {
          const stationDetails = blsResult[detailColumn];
          const checklistData = userChecklists[stationType];
          
          if (stationDetails && checklistData) {
            const stationName = detailColumn.replace('_details', '').replace(/_/g, ' ').toUpperCase();
            const performedCount = stationDetails.performed?.length || 0;
            const notPerformedCount = stationDetails.notPerformed?.length || 0;
            const totalItems = stationDetails.totalItems || 0;
            const percentage = totalItems > 0 ? Math.round((performedCount / totalItems) * 100) : 0;
            
            comments.push(`\n${stationName}:`);
            comments.push(`- Items Performed: ${performedCount}/${totalItems} (${percentage}%)`);
            comments.push(`- Status: ${stationDetails.status}`);
            
            // Add specific item analysis
            if (stationDetails.standardized_items) {
              const compulsoryItems = Object.entries(stationDetails.standardized_items)
                .filter(([_, item]) => item.compulsory)
                .map(([itemId, item]) => ({ id: itemId, ...item }));
              
              const performedCompulsory = compulsoryItems.filter(item => 
                stationDetails.performed?.includes(item.id)
              );
              
              const missedCompulsory = compulsoryItems.filter(item => 
                stationDetails.notPerformed?.includes(item.id)
              );
              
              if (performedCompulsory.length > 0) {
                comments.push(`- Compulsory Items Performed: ${performedCompulsory.length}/${compulsoryItems.length}`);
                performedCompulsory.slice(0, 3).forEach(item => {
                  comments.push(`  ✓ ${item.text}`);
                });
                if (performedCompulsory.length > 3) {
                  comments.push(`  ... and ${performedCompulsory.length - 3} more`);
                }
              }
              
              if (missedCompulsory.length > 0) {
                comments.push(`- Compulsory Items Missed: ${missedCompulsory.length}/${compulsoryItems.length}`);
                missedCompulsory.slice(0, 3).forEach(item => {
                  comments.push(`  ✗ ${item.text}`);
                });
                if (missedCompulsory.length > 3) {
                  comments.push(`  ... and ${missedCompulsory.length - 3} more`);
                }
              }
            }
            
            // Add checklist-specific comments if available
            if (checklistData.comments) {
              comments.push(`- Checklist Notes: ${checklistData.comments}`);
            }
          }
        });
        
        // Add overall recommendations
        const passCount = stationResults.filter(result => result.includes('PASS')).length;
        const totalStations = stationResults.length;
        
        if (passCount === totalStations) {
          comments.push(`\nOVERALL ASSESSMENT: Excellent performance across all stations.`);
        } else if (passCount >= totalStations * 0.8) {
          comments.push(`\nOVERALL ASSESSMENT: Good performance with room for improvement in some areas.`);
        } else if (passCount >= totalStations * 0.5) {
          comments.push(`\nOVERALL ASSESSMENT: Satisfactory performance but needs significant improvement.`);
        } else {
          comments.push(`\nOVERALL ASSESSMENT: Performance below standard, remedial training recommended.`);
        }
        
        // Add timestamp
        comments.push(`\nAssessment completed on: ${new Date().toLocaleDateString()}`);
        
        // Update the BLS result with comments
        const { error: updateError } = await supabase
          .from('bls_results')
          .update({ 
            comments: comments.join('\n'),
            updated_at: new Date().toISOString()
          })
          .eq('id', blsResult.id);
        
        if (updateError) {
          console.error(`❌ Error updating ${blsResult.id}:`, updateError);
          errorCount++;
        } else {
          console.log(`✅ Added comments to ${blsResult.id}`);
          updatedCount++;
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${blsResult.id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Comments addition complete!`);
    console.log(`📊 Total BLS results processed: ${blsResults.length}`);
    console.log(`✅ Successfully updated: ${updatedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    // 5. Verify the updates
    console.log('\n🔍 Verifying comments...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('bls_results')
      .select('id, comments')
      .not('comments', 'is', null)
      .limit(2);
    
    if (verifyError) {
      console.error('❌ Error verifying comments:', verifyError);
    } else {
      console.log('📈 Sample comments added:');
      verifyData.forEach((result, index) => {
        const commentLines = result.comments?.split('\n') || [];
        console.log(`\n   Sample ${index + 1} (${commentLines.length} lines):`);
        commentLines.slice(0, 5).forEach(line => {
          console.log(`   ${line}`);
        });
        if (commentLines.length > 5) {
          console.log(`   ... and ${commentLines.length - 5} more lines`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Comments addition failed:', error);
  }
}

// Run the script
addCommentsToBLSResults();
