// populateBLSComments.js
// Populate comments in bls_results using data from checklist_results

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E'
);

async function populateBLSComments() {
  try {
    console.log('💬 Populating BLS Results comments using checklist_results data...\n');
    
    // 1. Get all BLS results
    console.log('1. 🏥 Fetching BLS results...');
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('id, user_id, one_man_cpr_details, two_man_cpr_details, infant_cpr_details, adult_choking_details, infant_choking_details, comments')
      .order('created_at', { ascending: true });
    
    if (blsError) {
      console.error('❌ Error fetching BLS results:', blsError);
      return;
    }
    
    console.log(`   📊 Found ${blsResults.length} BLS results`);
    
    // 2. Get all checklist results organized by user and station
    console.log('\n2. 📋 Fetching checklist results...');
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
    
    // 3. Generate comprehensive comments for each BLS result
    console.log('\n3. 💬 Generating detailed comments...');
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const blsResult of blsResults) {
      try {
        const userId = blsResult.user_id;
        const userChecklists = checklistByUser[userId] || {};
        
        // Generate comprehensive comments
        const comments = [];
        
        // Add header
        comments.push('=== BLS ASSESSMENT DETAILED ANALYSIS ===');
        comments.push(`Assessment Date: ${new Date().toLocaleDateString()}`);
        comments.push(`User ID: ${userId}`);
        comments.push('');
        
        // Add overall performance summary
        const stationResults = [];
        const stationDetails = {};
        
        if (blsResult.one_man_cpr_details) {
          const cpr = blsResult.one_man_cpr_details;
          stationResults.push(`One Man CPR: ${cpr.status} (${cpr.score}/${cpr.totalItems})`);
          stationDetails['One Man CPR'] = cpr;
        }
        if (blsResult.two_man_cpr_details) {
          const cpr = blsResult.two_man_cpr_details;
          stationResults.push(`Two Man CPR: ${cpr.status} (${cpr.score}/${cpr.totalItems})`);
          stationDetails['Two Man CPR'] = cpr;
        }
        if (blsResult.infant_cpr_details) {
          const cpr = blsResult.infant_cpr_details;
          stationResults.push(`Infant CPR: ${cpr.status} (${cpr.score}/${cpr.totalItems})`);
          stationDetails['Infant CPR'] = cpr;
        }
        if (blsResult.adult_choking_details) {
          const choking = blsResult.adult_choking_details;
          stationResults.push(`Adult Choking: ${choking.status} (${choking.score}/${choking.totalItems})`);
          stationDetails['Adult Choking'] = choking;
        }
        if (blsResult.infant_choking_details) {
          const choking = blsResult.infant_choking_details;
          stationResults.push(`Infant Choking: ${choking.status} (${choking.score}/${choking.totalItems})`);
          stationDetails['Infant Choking'] = choking;
        }
        
        if (stationResults.length > 0) {
          comments.push('PERFORMANCE SUMMARY:');
          stationResults.forEach(result => {
            comments.push(`• ${result}`);
          });
          comments.push('');
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
            
            comments.push(`--- ${stationName} ANALYSIS ---`);
            comments.push(`Overall Performance: ${stationDetails.status} (${percentage}%)`);
            comments.push(`Items Completed: ${performedCount}/${totalItems}`);
            comments.push(`Items Missed: ${notPerformedCount}/${totalItems}`);
            comments.push('');
            
            // Add specific item analysis
            if (stationDetails.standardized_items) {
              const allItems = Object.entries(stationDetails.standardized_items)
                .map(([itemId, item]) => ({ id: itemId, ...item }));
              
              const compulsoryItems = allItems.filter(item => item.compulsory);
              const optionalItems = allItems.filter(item => !item.compulsory);
              
              const performedCompulsory = compulsoryItems.filter(item => 
                stationDetails.performed?.includes(item.id)
              );
              
              const missedCompulsory = compulsoryItems.filter(item => 
                stationDetails.notPerformed?.includes(item.id)
              );
              
              const performedOptional = optionalItems.filter(item => 
                stationDetails.performed?.includes(item.id)
              );
              
              // Compulsory items analysis
              if (compulsoryItems.length > 0) {
                comments.push(`COMPULSORY ITEMS (${compulsoryItems.length} total):`);
                comments.push(`✓ Performed: ${performedCompulsory.length}/${compulsoryItems.length}`);
                
                if (performedCompulsory.length > 0) {
                  comments.push('  Successfully completed:');
                  performedCompulsory.slice(0, 5).forEach(item => {
                    comments.push(`  • ${item.text}`);
                  });
                  if (performedCompulsory.length > 5) {
                    comments.push(`  ... and ${performedCompulsory.length - 5} more compulsory items`);
                  }
                }
                
                if (missedCompulsory.length > 0) {
                  comments.push(`✗ Missed: ${missedCompulsory.length}/${compulsoryItems.length}`);
                  comments.push('  Areas for improvement:');
                  missedCompulsory.slice(0, 5).forEach(item => {
                    comments.push(`  • ${item.text}`);
                  });
                  if (missedCompulsory.length > 5) {
                    comments.push(`  ... and ${missedCompulsory.length - 5} more missed items`);
                  }
                }
                comments.push('');
              }
              
              // Optional items analysis
              if (optionalItems.length > 0) {
                comments.push(`OPTIONAL ITEMS (${optionalItems.length} total):`);
                comments.push(`✓ Performed: ${performedOptional.length}/${optionalItems.length}`);
                comments.push('');
              }
              
              // Category analysis
              const categoryAnalysis = {};
              allItems.forEach(item => {
                if (!categoryAnalysis[item.category]) {
                  categoryAnalysis[item.category] = { total: 0, performed: 0 };
                }
                categoryAnalysis[item.category].total++;
                if (stationDetails.performed?.includes(item.id)) {
                  categoryAnalysis[item.category].performed++;
                }
              });
              
              comments.push('CATEGORY BREAKDOWN:');
              Object.entries(categoryAnalysis).forEach(([category, stats]) => {
                const percentage = Math.round((stats.performed / stats.total) * 100);
                comments.push(`• ${category}: ${stats.performed}/${stats.total} (${percentage}%)`);
              });
              comments.push('');
            }
            
            // Add checklist-specific comments if available
            if (checklistData.comments) {
              comments.push(`CHECKLIST NOTES: ${checklistData.comments}`);
              comments.push('');
            }
          }
        });
        
        // Add overall recommendations
        const passCount = stationResults.filter(result => result.includes('PASS')).length;
        const totalStations = stationResults.length;
        const passPercentage = Math.round((passCount / totalStations) * 100);
        
        comments.push('=== OVERALL ASSESSMENT ===');
        if (passCount === totalStations) {
          comments.push('🎉 EXCELLENT: Perfect performance across all stations!');
          comments.push('Recommendation: Ready for certification and advanced training.');
        } else if (passPercentage >= 80) {
          comments.push('✅ GOOD: Strong performance with minor areas for improvement.');
          comments.push('Recommendation: Focus on specific weak areas, ready for certification.');
        } else if (passPercentage >= 60) {
          comments.push('⚠️ SATISFACTORY: Adequate performance but needs improvement.');
          comments.push('Recommendation: Additional practice recommended before certification.');
        } else if (passPercentage >= 40) {
          comments.push('❌ NEEDS IMPROVEMENT: Below standard performance.');
          comments.push('Recommendation: Remedial training required before re-assessment.');
        } else {
          comments.push('🚨 UNSATISFACTORY: Performance well below standard.');
          comments.push('Recommendation: Comprehensive remedial training and re-assessment required.');
        }
        
        comments.push('');
        comments.push(`Overall Pass Rate: ${passCount}/${totalStations} stations (${passPercentage}%)`);
        comments.push(`Assessment completed: ${new Date().toLocaleString()}`);
        
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
          console.log(`✅ Added detailed comments to ${blsResult.id}`);
          updatedCount++;
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${blsResult.id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Comments population complete!`);
    console.log(`📊 Total BLS results processed: ${blsResults.length}`);
    console.log(`✅ Successfully updated: ${updatedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    // 4. Verify the updates
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
        commentLines.slice(0, 8).forEach(line => {
          console.log(`   ${line}`);
        });
        if (commentLines.length > 8) {
          console.log(`   ... and ${commentLines.length - 8} more lines`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Comments population failed:', error);
  }
}

// Run the script
populateBLSComments();
