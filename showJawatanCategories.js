// showJawatanCategories.js
// Show current jawatan categorization logic

// Current clinical jawatan list from scoreUtils.js
const CLINICAL_JAWATAN = [
  "PEGAWAI PERUBATAN",
  "PENOLONG PEGAWAI PERUBATAN", 
  "JURURAWAT",
  "JURURAWAT MASYARAKAT",
  "PEGAWAI PERGIGIAN",
  "PEMBANTU PERAWATAN KESIHATAN",
  "JURUTERAPI PERGIGIAN"
];

// Full jawatan list from AddUserScreen.js
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

console.log('🔍 JAWATAN CATEGORIZATION ANALYSIS\n');
console.log('==================================\n');

console.log('📊 CURRENT CLINICAL JAWATAN LIST:');
console.log('================================');
CLINICAL_JAWATAN.forEach((jawatan, index) => {
  console.log(`${index + 1}. ${jawatan}`);
});

console.log('\n📋 ALL JAWATAN VALUES FROM ADDUSERSCREEN:');
console.log('==========================================');

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

console.log('\n⚠️  POTENTIAL ISSUES:');
console.log('====================');

const missingFromClinical = nonClinicalJawatan.filter(j => 
  j.jawatan.toUpperCase().includes('PERUBATAN') || 
  j.jawatan.toUpperCase().includes('JURURAWAT') ||
  j.jawatan.toUpperCase().includes('PERGIGIAN') ||
  j.jawatan.toUpperCase().includes('PERAWATAN') ||
  j.jawatan.toUpperCase().includes('FARMASI') ||
  j.jawatan.toUpperCase().includes('MAKMAL') ||
  j.jawatan.toUpperCase().includes('PULIH') ||
  j.jawatan.toUpperCase().includes('XRAY')
);

if (missingFromClinical.length > 0) {
  console.log('❌ These jawatan might be clinical but are categorized as non-clinical:');
  missingFromClinical.forEach(item => {
    console.log(`   - ${item.jawatan}`);
  });
}

const extraInClinical = clinicalJawatan.filter(j => !j.isInClinicalList);
if (extraInClinical.length > 0) {
  console.log('❌ These jawatan are categorized as clinical but not in the clinical list:');
  extraInClinical.forEach(item => {
    console.log(`   - ${item.jawatan}`);
  });
}

if (missingFromClinical.length === 0 && extraInClinical.length === 0) {
  console.log('✅ No issues found! Categorization looks correct.');
}

console.log('\n💡 SUGGESTED UPDATES TO CLINICAL_JAWATAN LIST:');
console.log('==============================================');

if (missingFromClinical.length > 0) {
  console.log('Consider adding these to CLINICAL_JAWATAN:');
  missingFromClinical.forEach(item => {
    console.log(`  "${item.jawatan}",`);
  });
} else {
  console.log('No additional jawatan need to be added to clinical list.');
}

console.log('\n📝 CURRENT CATEGORIZATION LOGIC:');
console.log('===============================');
console.log('The system checks if the jawatan contains any of these clinical keywords:');
CLINICAL_JAWATAN.forEach(jawatan => {
  console.log(`- "${jawatan}"`);
});
console.log('\nIf ANY of these keywords are found in the jawatan, it\'s classified as CLINICAL.');
console.log('Otherwise, it\'s classified as NON-CLINICAL.');
