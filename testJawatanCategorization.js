// testJawatanCategorization.js
// Test script to verify jawatan categorization is working correctly

import { getUserCategorySync } from './src/utils/scoreUtils.js';

// Test cases based on your feedback
const testCases = [
  // Clinical (should be clinical)
  { jawatan: 'PEGAWAI PERUBATAN', expected: 'clinical' },
  { jawatan: 'PENOLONG PEGAWAI PERUBATAN', expected: 'clinical' },
  { jawatan: 'JURURAWAT', expected: 'clinical' },
  { jawatan: 'JURURAWAT MASYARAKAT', expected: 'clinical' },
  { jawatan: 'PEMBANTU PERAWATAN KESIHATAN', expected: 'clinical' },
  { jawatan: 'PEGAWAI PERGIGIAN', expected: 'clinical' },
  { jawatan: 'JURUTERAPI PERGIGIAN', expected: 'clinical' },
  
  // Non-Clinical (should be non-clinical)
  { jawatan: 'JURUPULIH FISIOTERAPI', expected: 'non-clinical' },
  { jawatan: 'PEGAWAI FARMASI', expected: 'non-clinical' },
  { jawatan: 'JURU-XRAY', expected: 'non-clinical' },
  { jawatan: 'JURUTEKNOLOGI MAKMAL PERUBATAN', expected: 'non-clinical' },
  { jawatan: 'PENOLONG PEGAWAI TADBIR', expected: 'non-clinical' },
  { jawatan: 'PEMBANTU KHIDMAT AM', expected: 'non-clinical' },
  { jawatan: 'PEMBANTU TADBIR', expected: 'non-clinical' },
  { jawatan: 'PEMBANTU PENYEDIAAN MAKANAN', expected: 'non-clinical' },
  { jawatan: 'PENOLONG JURUTERA', expected: 'non-clinical' },
  { jawatan: 'Staff', expected: 'non-clinical' },
  { jawatan: 'Administrator', expected: 'non-clinical' }
];

console.log('🧪 Testing Jawatan Categorization...\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = getUserCategorySync(testCase.jawatan);
  const status = result === testCase.expected ? '✅ PASS' : '❌ FAIL';
  
  if (result === testCase.expected) {
    passed++;
  } else {
    failed++;
  }
  
  console.log(`${index + 1}. ${status} ${testCase.jawatan}`);
  console.log(`   Expected: ${testCase.expected}, Got: ${result}`);
  console.log('');
});

console.log('📊 Test Results:');
console.log(`   Passed: ${passed}`);
console.log(`   Failed: ${failed}`);
console.log(`   Total: ${testCases.length}`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! Categorization is working correctly.');
} else {
  console.log(`\n⚠️  ${failed} tests failed. Please check the categorization logic.`);
}
