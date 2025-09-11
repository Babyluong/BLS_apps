// checkJawatanCategorization.js
// Script to check jawatan values and their clinical/non-clinical categorization

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

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

async function checkJawatanCategorization() {
  console.log('🔍 Checking Jawatan Categorization...\n');
  
  try {
    // Get all unique jawatan values from profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('jawatan, full_name')
      .not('jawatan', 'is', null);
    
    if (error) {
      console.error('❌ Error fetching profiles:', error);
      return;
    }
    
    // Get unique jawatan values
    const uniqueJawatan = [...new Set(profiles.map(p => p.jawatan))];
    
    console.log('📊 CURRENT CLINICAL JAWATAN LIST:');
    console.log('================================');
    CLINICAL_JAWATAN.forEach((jawatan, index) => {
      console.log(`${index + 1}. ${jawatan}`);
    });
    
    console.log('\n📋 ALL JAWATAN VALUES IN DATABASE:');
    console.log('==================================');
    
    const categorizedJawatan = uniqueJawatan.map(jawatan => {
      const category = getUserCategory(jawatan);
      const isInClinicalList = CLINICAL_JAWATAN.some(clinical => 
        jawatan.toUpperCase().includes(clinical)
      );
      
      return {
        jawatan,
        category,
        isInClinicalList,
        count: profiles.filter(p => p.jawatan === jawatan).length
      };
    });
    
    // Sort by category then by count
    categorizedJawatan.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category === 'clinical' ? -1 : 1;
      }
      return b.count - a.count;
    });
    
    console.log('\n🏥 CLINICAL CATEGORY:');
    console.log('====================');
    const clinicalJawatan = categorizedJawatan.filter(j => j.category === 'clinical');
    clinicalJawatan.forEach((item, index) => {
      const status = item.isInClinicalList ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${item.jawatan} (${item.count} users)`);
    });
    
    console.log('\n🏢 NON-CLINICAL CATEGORY:');
    console.log('=========================');
    const nonClinicalJawatan = categorizedJawatan.filter(j => j.category === 'non-clinical');
    nonClinicalJawatan.forEach((item, index) => {
      const status = item.isInClinicalList ? '❌' : '✅';
      console.log(`${index + 1}. ${status} ${item.jawatan} (${item.count} users)`);
    });
    
    console.log('\n📈 SUMMARY:');
    console.log('===========');
    console.log(`Total unique jawatan: ${uniqueJawatan.length}`);
    console.log(`Clinical jawatan: ${clinicalJawatan.length}`);
    console.log(`Non-clinical jawatan: ${nonClinicalJawatan.length}`);
    
    // Check for potential issues
    console.log('\n⚠️  POTENTIAL ISSUES:');
    console.log('====================');
    
    const missingFromClinical = nonClinicalJawatan.filter(j => 
      j.jawatan.toUpperCase().includes('PERUBATAN') || 
      j.jawatan.toUpperCase().includes('JURURAWAT') ||
      j.jawatan.toUpperCase().includes('PERGIGIAN') ||
      j.jawatan.toUpperCase().includes('PERAWATAN')
    );
    
    if (missingFromClinical.length > 0) {
      console.log('❌ These jawatan might be clinical but are categorized as non-clinical:');
      missingFromClinical.forEach(item => {
        console.log(`   - ${item.jawatan} (${item.count} users)`);
      });
    }
    
    const extraInClinical = clinicalJawatan.filter(j => !j.isInClinicalList);
    if (extraInClinical.length > 0) {
      console.log('❌ These jawatan are categorized as clinical but not in the clinical list:');
      extraInClinical.forEach(item => {
        console.log(`   - ${item.jawatan} (${item.count} users)`);
      });
    }
    
    if (missingFromClinical.length === 0 && extraInClinical.length === 0) {
      console.log('✅ No issues found! Categorization looks correct.');
    }
    
    console.log('\n💡 SUGGESTED UPDATES TO CLINICAL_JAWATAN LIST:');
    console.log('==============================================');
    
    const suggestedClinical = nonClinicalJawatan.filter(j => 
      j.jawatan.toUpperCase().includes('PERUBATAN') || 
      j.jawatan.toUpperCase().includes('JURURAWAT') ||
      j.jawatan.toUpperCase().includes('PERGIGIAN') ||
      j.jawatan.toUpperCase().includes('PERAWATAN') ||
      j.jawatan.toUpperCase().includes('FARMASI') ||
      j.jawatan.toUpperCase().includes('MAKMAL') ||
      j.jawatan.toUpperCase().includes('PULIH') ||
      j.jawatan.toUpperCase().includes('XRAY')
    );
    
    if (suggestedClinical.length > 0) {
      console.log('Consider adding these to CLINICAL_JAWATAN:');
      suggestedClinical.forEach(item => {
        console.log(`  "${item.jawatan}",`);
      });
    } else {
      console.log('No additional jawatan need to be added to clinical list.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the check
checkJawatanCategorization();
