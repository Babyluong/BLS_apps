// Run Database Sync Verification
// Execute this with: node runDatabaseSync.js

import supabase from './services/supabase.js';

async function runDatabaseSyncCheck() {
  console.log('🚀 Starting Supabase Table Sync Verification...\n');
  
  try {
    // 1. Check Active Profiles
    console.log('1️⃣ Checking Active Profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .not('role', 'in', '("admin","staff")');
    
    if (profilesError) throw profilesError;
    
    console.log(`✅ Found ${profiles.length} active profiles (excluding admin/staff)`);
    
    // 2. Check BLS Results
    console.log('\n2️⃣ Checking BLS Results...');
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('*');
    
    if (blsError) throw blsError;
    
    const profileIds = new Set(profiles.map(p => p.id));
    const orphanedBLS = blsResults.filter(r => !profileIds.has(r.user_id));
    const missingJawatan = blsResults.filter(r => !r.jawatan || r.jawatan === 'Unknown Position');
    
    console.log(`✅ Total BLS Results: ${blsResults.length}`);
    console.log(`⚠️  Orphaned BLS Results: ${orphanedBLS.length}`);
    console.log(`⚠️  Missing Jawatan: ${missingJawatan.length}`);
    
    // 3. Check Checklist Results
    console.log('\n3️⃣ Checking Checklist Results...');
    const { data: checklistResults, error: checklistError } = await supabase
      .from('checklist_results')
      .select('*');
    
    if (checklistError) throw checklistError;
    
    const orphanedChecklist = checklistResults.filter(r => !profileIds.has(r.user_id));
    
    console.log(`✅ Total Checklist Results: ${checklistResults.length}`);
    console.log(`⚠️  Orphaned Checklist Results: ${orphanedChecklist.length}`);
    
    // 4. Check Quiz Sessions
    console.log('\n4️⃣ Checking Quiz Sessions...');
    const { data: quizSessions, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('*');
    
    if (quizError) throw quizError;
    
    const orphanedQuiz = quizSessions.filter(r => !profileIds.has(r.user_id));
    
    console.log(`✅ Total Quiz Sessions: ${quizSessions.length}`);
    console.log(`⚠️  Orphaned Quiz Sessions: ${orphanedQuiz.length}`);
    
    // 5. Cross-table integrity
    console.log('\n5️⃣ Checking Cross-table Integrity...');
    const usersWithBLS = new Set(blsResults.map(r => r.user_id));
    const usersWithChecklist = new Set(checklistResults.map(r => r.user_id));
    
    const missingChecklist = [...usersWithBLS].filter(id => !usersWithChecklist.has(id));
    const missingBLS = [...usersWithChecklist].filter(id => !usersWithBLS.has(id));
    
    console.log(`⚠️  Users with BLS but no Checklist: ${missingChecklist.length}`);
    console.log(`⚠️  Users with Checklist but no BLS: ${missingBLS.length}`);
    
    // 6. Summary Report
    console.log('\n📊 FINAL SYNC REPORT');
    console.log('=' * 40);
    console.log(`✅ Active Profiles: ${profiles.length}`);
    console.log(`✅ BLS Results: ${blsResults.length}`);
    console.log(`✅ Checklist Results: ${checklistResults.length}`);
    console.log(`✅ Quiz Sessions: ${quizSessions.length}`);
    console.log('');
    console.log('⚠️  ISSUES FOUND:');
    console.log(`• Orphaned BLS Results: ${orphanedBLS.length}`);
    console.log(`• Orphaned Checklist Results: ${orphanedChecklist.length}`);
    console.log(`• Orphaned Quiz Sessions: ${orphanedQuiz.length}`);
    console.log(`• Missing Jawatan Data: ${missingJawatan.length}`);
    console.log(`• Missing Cross-references: ${missingChecklist.length + missingBLS.length}`);
    
    // 7. Recommendations
    console.log('\n🛠️  RECOMMENDATIONS:');
    if (orphanedBLS.length > 0 || orphanedChecklist.length > 0 || orphanedQuiz.length > 0) {
      console.log('• Run the cleanup script to remove orphaned records');
    }
    if (missingJawatan.length > 0) {
      console.log('• Update BLS results with jawatan data from profiles');
    }
    if (missingChecklist.length > 0 || missingBLS.length > 0) {
      console.log('• Investigate incomplete assessment records');
    }
    
    const totalIssues = orphanedBLS.length + orphanedChecklist.length + orphanedQuiz.length + missingJawatan.length;
    
    if (totalIssues === 0) {
      console.log('\n🎉 Database is perfectly synced! No issues found.');
    } else {
      console.log(`\n⚠️  Found ${totalIssues} total issues that need attention.`);
      console.log('Run supabaseCleanupScript.sql to fix these issues.');
    }
    
  } catch (error) {
    console.error('❌ Database sync check failed:', error);
  }
}

// Run the check
runDatabaseSyncCheck();
