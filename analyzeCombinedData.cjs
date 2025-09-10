const fs = require('fs');

// Read the combined results
const data = JSON.parse(fs.readFileSync('final_combined_bls_results.json', 'utf8'));

console.log('📊 Analysis of Combined Data:');
console.log(`Total records: ${data.length}`);

// Count records with different combinations
let withTestScores = 0;
let withChecklistResults = 0;
let withBoth = 0;
let withNeither = 0;

data.forEach(record => {
  const hasTestScores = record.pre_test_score > 0 || record.post_test_score > 0;
  const hasChecklistResults = record.one_man_cpr_pass || record.two_man_cpr_pass || 
                             record.adult_choking_pass || record.infant_choking_pass || 
                             record.infant_cpr_pass;
  
  if (hasTestScores && hasChecklistResults) {
    withBoth++;
  } else if (hasTestScores) {
    withTestScores++;
  } else if (hasChecklistResults) {
    withChecklistResults++;
  } else {
    withNeither++;
  }
});

console.log(`\n📈 Breakdown:`);
console.log(`Records with test scores only: ${withTestScores}`);
console.log(`Records with checklist results only: ${withChecklistResults}`);
console.log(`Records with BOTH test scores AND checklist results: ${withBoth}`);
console.log(`Records with neither: ${withNeither}`);

// Show some examples of combined records
console.log(`\n🔍 Examples of records with BOTH test scores and checklist results:`);
let examplesShown = 0;
data.forEach((record, index) => {
  const hasTestScores = record.pre_test_score > 0 || record.post_test_score > 0;
  const hasChecklistResults = record.one_man_cpr_pass || record.two_man_cpr_pass || 
                             record.adult_choking_pass || record.infant_choking_pass || 
                             record.infant_cpr_pass;
  
  if (hasTestScores && hasChecklistResults && examplesShown < 3) {
    console.log(`\nRecord ${index + 1}:`);
    console.log(`  User ID: ${record.user_id}`);
    console.log(`  Pre-test: ${record.pre_test_score}, Post-test: ${record.post_test_score}`);
    console.log(`  CPR: ${record.one_man_cpr_pass ? 'PASS' : 'FAIL'}, Choking: ${record.adult_choking_pass ? 'PASS' : 'FAIL'}`);
    examplesShown++;
  }
});

// Show some examples of test-only records
console.log(`\n🔍 Examples of records with test scores only:`);
examplesShown = 0;
data.forEach((record, index) => {
  const hasTestScores = record.pre_test_score > 0 || record.post_test_score > 0;
  const hasChecklistResults = record.one_man_cpr_pass || record.two_man_cpr_pass || 
                             record.adult_choking_pass || record.infant_choking_pass || 
                             record.infant_cpr_pass;
  
  if (hasTestScores && !hasChecklistResults && examplesShown < 3) {
    console.log(`\nRecord ${index + 1}:`);
    console.log(`  User ID: ${record.user_id}`);
    console.log(`  Pre-test: ${record.pre_test_score}, Post-test: ${record.post_test_score}`);
    console.log(`  CPR: ${record.one_man_cpr_pass ? 'PASS' : 'FAIL'}, Choking: ${record.adult_choking_pass ? 'PASS' : 'FAIL'}`);
    examplesShown++;
  }
});

// Show some examples of checklist-only records
console.log(`\n🔍 Examples of records with checklist results only:`);
examplesShown = 0;
data.forEach((record, index) => {
  const hasTestScores = record.pre_test_score > 0 || record.post_test_score > 0;
  const hasChecklistResults = record.one_man_cpr_pass || record.two_man_cpr_pass || 
                             record.adult_choking_pass || record.infant_choking_pass || 
                             record.infant_cpr_pass;
  
  if (!hasTestScores && hasChecklistResults && examplesShown < 3) {
    console.log(`\nRecord ${index + 1}:`);
    console.log(`  User ID: ${record.user_id}`);
    console.log(`  Pre-test: ${record.pre_test_score}, Post-test: ${record.post_test_score}`);
    console.log(`  CPR: ${record.one_man_cpr_pass ? 'PASS' : 'FAIL'}, Choking: ${record.adult_choking_pass ? 'PASS' : 'FAIL'}`);
    examplesShown++;
  }
});
