// runBLSCombination.js
// Simple script to run the BLS results combination process

const { combineBLSResults } = require('./combineBLSResults.js');

async function runCombination() {
  try {
    console.log('🚀 Starting BLS Results Combination Process...\n');
    
    await combineBLSResults();
    
    console.log('\n🎉 BLS Results combination completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test the implementation with: node testCombinedBLSResults.js');
    console.log('2. Update your BLS Results screen to use the new combined data');
    console.log('3. Verify that all data is properly combined in the bls_result table');
    
  } catch (error) {
    console.error('❌ Error running BLS combination:', error);
    process.exit(1);
  }
}

// Run the combination
runCombination();

