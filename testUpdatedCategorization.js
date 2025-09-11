// testUpdatedCategorization.js
// Test the updated clinical jawatan categorization

// Updated clinical jawatan list (only 7 positions)
const CLINICAL_JAWATAN = [
  "PEGAWAI PERUBATAN",
  "PENOLONG PEGAWAI PERUBATAN",
  "JURURAWAT",
  "JURURAWAT MASYARAKAT",
  "PEMBANTU PERAWATAN KESIHATAN",
  "PEGAWAI PERGIGIAN",
  "JURUTERAPI PERGIGIAN"
];

// All jawatan from AddUserScreen.js
const FULL_JAWATAN_LIST = [
  // Officer level
  "PEGAWAI PERUBATAN",
  "PEGAWAI PERGIGIAN", 
  "PEGAWAI FARMASI",

  // Others
  "PENOLONG PEGAWAI PERUBATAN",
  "JURURAWAT",
  "PENOLONG PEGAWAI FARMASI",
  "JURUTEKNOLOGI MAKMAL PERUBATAN",
  "JURUPULIH PERUBATAN CARAKERJA",
  "JURUPULIH FISIOTERAPI",
  "JURU-XRAY",
  "PENOLONG PEGAWAI TADBIR",
  "PEMBANTU KHIDMAT AM",
  "PEMBANTU TADBIR",
  "PEMBANTU PERAWATAN KESIHATAN",
  "JURURAWAT MASYARAKAT",
  "PEMBANTU PENYEDIAAN MAKANAN",
  "PENOLONG JURUTERA",
];

function getUserCategory(jawatan) {
  if (!jawatan) return 'non-clinical';
  
  const jawatanUpper = String(jawatan).toUpperCase().trim();
  
  // Check if any clinical jawatan is contained in the user's jawatan
  const isClinical = CLINICAL_JAWATAN.some(clinicalJawatan => 
    jawatanUpper.includes(clinicalJawatan)
  );
  
  return isClinical ? 'clinical' : 'non-clinical';
}

console.log('✅ UPDATED CLINICAL JAWATAN CATEGORIZATION TEST\n');
console.log('==============================================\n');

console.log('🏥 CLINICAL JAWATAN (Only 7 positions):');
console.log('=======================================');
CLINICAL_JAWATAN.forEach((jawatan, index) => {
  console.log(`${index + 1}. ${jawatan}`);
});

console.log('\n📋 CATEGORIZATION RESULTS:');
console.log('==========================');

const categorizedJawatan = FULL_JAWATAN_LIST.map(jawatan => {
  const category = getUserCategory(jawatan);
  const isInClinicalList = CLINICAL_JAWATAN.some(clinical => 
    jawatan.toUpperCase().includes(clinical)
  );
  
  return {
    jawatan,
    category,
    isInClinicalList
  };
});

// Sort by category
categorizedJawatan.sort((a, b) => {
  if (a.category !== b.category) {
    return a.category === 'clinical' ? -1 : 1;
  }
  return a.jawatan.localeCompare(b.jawatan);
});

console.log('\n🏥 CLINICAL CATEGORY:');
console.log('====================');
const clinicalJawatan = categorizedJawatan.filter(j => j.category === 'clinical');
clinicalJawatan.forEach((item, index) => {
  const status = item.isInClinicalList ? '✅' : '❌';
  console.log(`${index + 1}. ${status} ${item.jawatan}`);
});

console.log('\n🏢 NON-CLINICAL CATEGORY:');
console.log('=========================');
const nonClinicalJawatan = categorizedJawatan.filter(j => j.category === 'non-clinical');
nonClinicalJawatan.forEach((item, index) => {
  const status = item.isInClinicalList ? '❌' : '✅';
  console.log(`${index + 1}. ${status} ${item.jawatan}`);
});

console.log('\n📊 SUMMARY:');
console.log('===========');
console.log(`Total jawatan: ${FULL_JAWATAN_LIST.length}`);
console.log(`Clinical: ${clinicalJawatan.length}`);
console.log(`Non-clinical: ${nonClinicalJawatan.length}`);

// Check for any issues
const issues = [];
const extraInClinical = clinicalJawatan.filter(j => !j.isInClinicalList);
const missingFromClinical = nonClinicalJawatan.filter(j => j.isInClinicalList);

if (extraInClinical.length > 0) {
  issues.push(`❌ ${extraInClinical.length} jawatan incorrectly categorized as clinical`);
}

if (missingFromClinical.length > 0) {
  issues.push(`❌ ${missingFromClinical.length} jawatan incorrectly categorized as non-clinical`);
}

if (issues.length === 0) {
  console.log('\n✅ PERFECT! All categorizations are correct.');
} else {
  console.log('\n⚠️  ISSUES FOUND:');
  issues.forEach(issue => console.log(issue));
}

console.log('\n🎯 EXPECTED CLINICAL POSITIONS:');
console.log('===============================');
console.log('1. ✅ PEGAWAI PERUBATAN');
console.log('2. ✅ PENOLONG PEGAWAI PERUBATAN');
console.log('3. ✅ JURURAWAT');
console.log('4. ✅ JURURAWAT MASYARAKAT');
console.log('5. ✅ PEMBANTU PERAWATAN KESIHATAN');
console.log('6. ✅ PEGAWAI PERGIGIAN');
console.log('7. ✅ JURUTERAPI PERGIGIAN');
console.log('\nAll other positions should be NON-CLINICAL.');
