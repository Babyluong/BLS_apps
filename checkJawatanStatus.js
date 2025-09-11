// Quick check of jawatan status in BLS results
import supabase from './services/supabase.js';

async function checkJawatanStatus() {
  console.log('🔍 Checking Jawatan Status in BLS Results...\n');
  
  try {
    // Check current jawatan status
    const { data: results, error } = await supabase
      .from('bls_results')
      .select('id, user_id, participant_name, jawatan, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    
    console.log('📊 Recent BLS Results Jawatan Status:');
    console.log('=' * 50);
    
    results.forEach((result, index) => {
      const status = result.jawatan ? 
        (result.jawatan === 'Unknown Position' ? '⚠️  Unknown' : '✅ Valid') : 
        '❌ NULL';
      
      console.log(`${index + 1}. ${result.participant_name}`);
      console.log(`   Jawatan: ${result.jawatan || 'NULL'} (${status})`);
      console.log(`   Date: ${result.created_at?.split('T')[0]}`);
      console.log('');
    });
    
    // Count by status
    const nullCount = results.filter(r => !r.jawatan).length;
    const unknownCount = results.filter(r => r.jawatan === 'Unknown Position').length;
    const validCount = results.filter(r => r.jawatan && r.jawatan !== 'Unknown Position').length;
    
    console.log('📈 Summary:');
    console.log(`✅ Valid jawatan: ${validCount}`);
    console.log(`⚠️  Unknown Position: ${unknownCount}`);
    console.log(`❌ NULL: ${nullCount}`);
    console.log(`📝 Total checked: ${results.length}`);
    
    if (nullCount > 0 || unknownCount > 0) {
      console.log('\n🔧 Recommendation: Run fixJawatanData.sql to update missing data');
    } else {
      console.log('\n🎉 All recent records have proper jawatan data!');
    }
    
  } catch (error) {
    console.error('❌ Error checking jawatan status:', error);
  }
}

checkJawatanStatus();
