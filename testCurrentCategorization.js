// testCurrentCategorization.js
// Test script to verify current hardcoded categorization logic

// Current hardcoded clinical jawatan list from scoreUtils.js
const CLINICAL_JAWATAN = [
  "PEGAWAI PERUBATAN",
  "PENOLONG PEGAWAI PERUBATAN",
  "JURURAWAT",
  "JURURAWAT MASYARAKAT",
  "PEMBANTU PERAWATAN KESIHATAN",
  "PEGAWAI PERGIGIAN",
  "JURUTERAPI PERGIGIAN"
];

function getUserCategorySync(jawatan) {
  if (!jawatan) return 'non-clinical';
  
  const jawatanUpper = String(jawatan).toUpperCase().trim();
  const isClinical = CLINICAL_JAWATAN.some(clinicalJawatan => 
    jawatanUpper.includes(clinicalJawatan)
  );
  
  return isClinical ? 'clinical' : 'non-clinical';
}

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

console.log('🧪 Testing Current Jawatan Categorization Logic...\n');
console.log('📋 Clinical Jawatan List:');
CLINICAL_JAWATAN.forEach((jawatan, index) => {
  console.log(`   ${index + 1}. ${jawatan}`);
});
console.log('');

let passed = 0;
let failed = 0;

console.log('🔍 Test Results:');
console.log('================');

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

console.log('📊 Summary:');
console.log(`   Passed: ${passed}`);
console.log(`   Failed: ${failed}`);
console.log(`   Total: ${testCases.length}`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! Current categorization is working correctly.');
} else {
  console.log(`\n⚠️  ${failed} tests failed. The current logic needs to be updated.`);
  
  // Show which ones failed
  console.log('\n❌ Failed Tests:');
  testCases.forEach((testCase, index) => {
    const result = getUserCategorySync(testCase.jawatan);
    if (result !== testCase.expected) {
      console.log(`   ${testCase.jawatan}: Expected ${testCase.expected}, got ${result}`);
    }
  });
}
