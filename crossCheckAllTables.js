// Comprehensive Cross-Check for All Supabase Tables
// Verifies sync between: bls_results, checklist_results, quiz_sessions, profiles, checklist_items, questions

import supabase from './services/supabase.js';

class TableSyncChecker {
  constructor() {
    this.issues = [];
    this.summary = {
      profiles: 0,
      blsResults: 0,
      checklistResults: 0,
      quizSessions: 0,
      checklistItems: 0,
      questions: 0,
      orphanedRecords: 0,
      missingReferences: 0,
      dataInconsistencies: 0
    };
  }

  logIssue(type, description, data = null) {
    this.issues.push({ type, description, data, timestamp: new Date().toISOString() });
    console.warn(`⚠️  ${type}: ${description}`, data || '');
  }

  // 1. Check PROFILES table
  async checkProfiles() {
    console.log('1️⃣ Checking PROFILES table...');
    
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .not('role', 'in', '("admin","staff")');
    
    if (error) throw error;
    
    this.summary.profiles = profiles.length;
    console.log(`✅ Found ${profiles.length} active profiles`);
    
    // Check for missing essential data
    const incompleteProfiles = profiles.filter(p => 
      !p.full_name || !p.ic || !p.jawatan
    );
    
    if (incompleteProfiles.length > 0) {
      this.logIssue('INCOMPLETE_PROFILES', 
        `Found ${incompleteProfiles.length} profiles with missing essential data`, 
        incompleteProfiles.map(p => ({ id: p.id, name: p.full_name, missing: {
          name: !p.full_name,
          ic: !p.ic,
          jawatan: !p.jawatan
        }}))
      );
    }
    
    return profiles;
  }

  // 2. Check BLS_RESULTS table
  async checkBLSResults(profiles) {
    console.log('2️⃣ Checking BLS_RESULTS table...');
    
    const { data: blsResults, error } = await supabase
      .from('bls_results')
      .select('*');
    
    if (error) throw error;
    
    this.summary.blsResults = blsResults.length;
    console.log(`✅ Found ${blsResults.length} BLS results`);
    
    const profileIds = new Set(profiles.map(p => p.id));
    
    // Check orphaned BLS results
    const orphanedBLS = blsResults.filter(r => !profileIds.has(r.user_id));
    if (orphanedBLS.length > 0) {
      this.logIssue('ORPHANED_BLS', 
        `Found ${orphanedBLS.length} BLS results with no matching profile`, 
        orphanedBLS.map(r => ({ id: r.id, user_id: r.user_id, participant_name: r.participant_name }))
      );
      this.summary.orphanedRecords += orphanedBLS.length;
    }
    
    // Check missing jawatan
    const missingJawatan = blsResults.filter(r => !r.jawatan || r.jawatan === 'Unknown Position');
    if (missingJawatan.length > 0) {
      this.logIssue('MISSING_JAWATAN', 
        `Found ${missingJawatan.length} BLS results missing jawatan data`, 
        missingJawatan.map(r => ({ id: r.id, participant_name: r.participant_name, jawatan: r.jawatan }))
      );
    }
    
    // Check invalid scores
    const invalidScores = blsResults.filter(r => 
      r.pre_test_score < 0 || r.pre_test_score > 30 || 
      r.post_test_score < 0 || r.post_test_score > 30
    );
    if (invalidScores.length > 0) {
      this.logIssue('INVALID_SCORES', 
        `Found ${invalidScores.length} BLS results with invalid scores`, 
        invalidScores.map(r => ({ 
          id: r.id, 
          participant_name: r.participant_name, 
          pre_test: r.pre_test_score, 
          post_test: r.post_test_score 
        }))
      );
    }
    
    return blsResults;
  }

  // 3. Check CHECKLIST_RESULTS table
  async checkChecklistResults(profiles) {
    console.log('3️⃣ Checking CHECKLIST_RESULTS table...');
    
    const { data: checklistResults, error } = await supabase
      .from('checklist_results')
      .select('*');
    
    if (error) throw error;
    
    this.summary.checklistResults = checklistResults.length;
    console.log(`✅ Found ${checklistResults.length} checklist results`);
    
    const profileIds = new Set(profiles.map(p => p.id));
    
    // Check orphaned checklist results
    const orphanedChecklist = checklistResults.filter(r => !profileIds.has(r.user_id));
    if (orphanedChecklist.length > 0) {
      this.logIssue('ORPHANED_CHECKLIST', 
        `Found ${orphanedChecklist.length} checklist results with no matching profile`, 
        orphanedChecklist.map(r => ({ id: r.id, user_id: r.user_id, checklist_type: r.checklist_type }))
      );
      this.summary.orphanedRecords += orphanedChecklist.length;
    }
    
    // Check for invalid checklist types
    const validTypes = ['one-man-cpr', 'two-man-cpr', 'adult-choking', 'infant-choking', 'infant-cpr'];
    const invalidTypes = checklistResults.filter(r => !validTypes.includes(r.checklist_type));
    if (invalidTypes.length > 0) {
      this.logIssue('INVALID_CHECKLIST_TYPES', 
        `Found ${invalidTypes.length} checklist results with invalid types`, 
        invalidTypes.map(r => ({ id: r.id, checklist_type: r.checklist_type }))
      );
    }
    
    return checklistResults;
  }

  // 4. Check QUIZ_SESSIONS table
  async checkQuizSessions(profiles) {
    console.log('4️⃣ Checking QUIZ_SESSIONS table...');
    
    const { data: quizSessions, error } = await supabase
      .from('quiz_sessions')
      .select('*');
    
    if (error) throw error;
    
    this.summary.quizSessions = quizSessions.length;
    console.log(`✅ Found ${quizSessions.length} quiz sessions`);
    
    const profileIds = new Set(profiles.map(p => p.id));
    
    // Check orphaned quiz sessions
    const orphanedQuiz = quizSessions.filter(r => !profileIds.has(r.user_id));
    if (orphanedQuiz.length > 0) {
      this.logIssue('ORPHANED_QUIZ', 
        `Found ${orphanedQuiz.length} quiz sessions with no matching profile`, 
        orphanedQuiz.map(r => ({ id: r.id, user_id: r.user_id, test_type: r.test_type }))
      );
      this.summary.orphanedRecords += orphanedQuiz.length;
    }
    
    // Check for invalid test types
    const validTestTypes = ['pre-test', 'post-test'];
    const invalidTestTypes = quizSessions.filter(r => !validTestTypes.includes(r.test_type));
    if (invalidTestTypes.length > 0) {
      this.logIssue('INVALID_TEST_TYPES', 
        `Found ${invalidTestTypes.length} quiz sessions with invalid test types`, 
        invalidTestTypes.map(r => ({ id: r.id, test_type: r.test_type }))
      );
    }
    
    return quizSessions;
  }

  // 5. Check CHECKLIST_ITEMS table
  async checkChecklistItems() {
    console.log('5️⃣ Checking CHECKLIST_ITEMS table...');
    
    const { data: checklistItems, error } = await supabase
      .from('checklist_items')
      .select('*');
    
    if (error) throw error;
    
    this.summary.checklistItems = checklistItems.length;
    console.log(`✅ Found ${checklistItems.length} checklist items`);
    
    // Check for missing essential data
    const incompleteItems = checklistItems.filter(item => 
      !item.title || !item.checklist_type || !item.description
    );
    
    if (incompleteItems.length > 0) {
      this.logIssue('INCOMPLETE_CHECKLIST_ITEMS', 
        `Found ${incompleteItems.length} checklist items with missing data`, 
        incompleteItems.map(item => ({ id: item.id, title: item.title, missing: {
          title: !item.title,
          type: !item.checklist_type,
          description: !item.description
        }}))
      );
    }
    
    // Check for invalid checklist types
    const validTypes = ['one-man-cpr', 'two-man-cpr', 'adult-choking', 'infant-choking', 'infant-cpr'];
    const invalidTypes = checklistItems.filter(item => !validTypes.includes(item.checklist_type));
    if (invalidTypes.length > 0) {
      this.logIssue('INVALID_CHECKLIST_ITEM_TYPES', 
        `Found ${invalidTypes.length} checklist items with invalid types`, 
        invalidTypes.map(item => ({ id: item.id, checklist_type: item.checklist_type }))
      );
    }
    
    return checklistItems;
  }

  // 6. Check QUESTIONS table
  async checkQuestions() {
    console.log('6️⃣ Checking QUESTIONS table...');
    
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*');
    
    if (error) throw error;
    
    this.summary.questions = questions.length;
    console.log(`✅ Found ${questions.length} questions`);
    
    // Check for missing essential data
    const incompleteQuestions = questions.filter(q => 
      !q.question_text || !q.type || !q.correct_answer
    );
    
    if (incompleteQuestions.length > 0) {
      this.logIssue('INCOMPLETE_QUESTIONS', 
        `Found ${incompleteQuestions.length} questions with missing data`, 
        incompleteQuestions.map(q => ({ id: q.id, missing: {
          text: !q.question_text,
          type: !q.type,
          answer: !q.correct_answer
        }}))
      );
    }
    
    // Check for invalid question types
    const validTypes = ['pre-test', 'post-test'];
    const invalidTypes = questions.filter(q => !validTypes.includes(q.type));
    if (invalidTypes.length > 0) {
      this.logIssue('INVALID_QUESTION_TYPES', 
        `Found ${invalidTypes.length} questions with invalid types`, 
        invalidTypes.map(q => ({ id: q.id, type: q.type }))
      );
    }
    
    return questions;
  }

  // 7. Cross-table integrity checks
  async checkCrossTableIntegrity(profiles, blsResults, checklistResults, quizSessions, checklistItems, questions) {
    console.log('7️⃣ Checking cross-table integrity...');
    
    const profileIds = new Set(profiles.map(p => p.id));
    const usersWithBLS = new Set(blsResults.map(r => r.user_id));
    const usersWithChecklist = new Set(checklistResults.map(r => r.user_id));
    const usersWithQuiz = new Set(quizSessions.map(s => s.user_id));
    
    // Check users with BLS but no checklist
    const missingChecklist = [...usersWithBLS].filter(id => !usersWithChecklist.has(id));
    if (missingChecklist.length > 0) {
      this.logIssue('MISSING_CHECKLIST_FOR_BLS', 
        `Found ${missingChecklist.length} users with BLS results but no checklist results`, 
        missingChecklist
      );
      this.summary.missingReferences += missingChecklist.length;
    }
    
    // Check users with checklist but no BLS
    const missingBLS = [...usersWithChecklist].filter(id => !usersWithBLS.has(id));
    if (missingBLS.length > 0) {
      this.logIssue('MISSING_BLS_FOR_CHECKLIST', 
        `Found ${missingBLS.length} users with checklist results but no BLS results`, 
        missingBLS
      );
      this.summary.missingReferences += missingBLS.length;
    }
    
    // Check users with quiz but no BLS
    const missingBLSForQuiz = [...usersWithQuiz].filter(id => !usersWithBLS.has(id));
    if (missingBLSForQuiz.length > 0) {
      this.logIssue('MISSING_BLS_FOR_QUIZ', 
        `Found ${missingBLSForQuiz.length} users with quiz sessions but no BLS results`, 
        missingBLSForQuiz
      );
      this.summary.missingReferences += missingBLSForQuiz.length;
    }
    
    // Check checklist items coverage
    const checklistTypes = new Set(checklistResults.map(r => r.checklist_type));
    const availableChecklistItems = new Set(checklistItems.map(i => i.checklist_type));
    const missingChecklistItems = [...checklistTypes].filter(type => !availableChecklistItems.has(type));
    if (missingChecklistItems.length > 0) {
      this.logIssue('MISSING_CHECKLIST_ITEMS', 
        `Found ${missingChecklistItems.length} checklist types without corresponding items`, 
        missingChecklistItems
      );
    }
    
    // Check questions coverage
    const questionTypes = new Set(quizSessions.map(s => s.test_type));
    const availableQuestions = new Set(questions.map(q => q.type));
    const missingQuestions = [...questionTypes].filter(type => !availableQuestions.has(type));
    if (missingQuestions.length > 0) {
      this.logIssue('MISSING_QUESTIONS', 
        `Found ${missingQuestions.length} test types without corresponding questions`, 
        missingQuestions
      );
    }
  }

  // 8. Check for duplicates
  async checkDuplicates(blsResults, checklistResults, quizSessions) {
    console.log('8️⃣ Checking for duplicates...');
    
    // Check duplicate BLS results (same user, same date)
    const blsGroups = {};
    blsResults.forEach(result => {
      const key = `${result.user_id}_${result.created_at?.split('T')[0]}`;
      if (!blsGroups[key]) blsGroups[key] = [];
      blsGroups[key].push(result);
    });
    
    Object.entries(blsGroups).forEach(([key, group]) => {
      if (group.length > 1) {
        this.logIssue('DUPLICATE_BLS', 
          `Found ${group.length} BLS results for same user/date: ${key}`, 
          group.map(r => ({ id: r.id, participant_name: r.participant_name, created_at: r.created_at }))
        );
        this.summary.dataInconsistencies += group.length - 1;
      }
    });
    
    // Check duplicate checklist results
    const checklistGroups = {};
    checklistResults.forEach(result => {
      const key = `${result.user_id}_${result.checklist_type}_${result.created_at?.split('T')[0]}`;
      if (!checklistGroups[key]) checklistGroups[key] = [];
      checklistGroups[key].push(result);
    });
    
    Object.entries(checklistGroups).forEach(([key, group]) => {
      if (group.length > 1) {
        this.logIssue('DUPLICATE_CHECKLIST', 
          `Found ${group.length} checklist results for same user/type/date: ${key}`, 
          group.map(r => ({ id: r.id, checklist_type: r.checklist_type, created_at: r.created_at }))
        );
        this.summary.dataInconsistencies += group.length - 1;
      }
    });
    
    // Check duplicate quiz sessions
    const quizGroups = {};
    quizSessions.forEach(session => {
      const key = `${session.user_id}_${session.test_type}_${session.created_at?.split('T')[0]}`;
      if (!quizGroups[key]) quizGroups[key] = [];
      quizGroups[key].push(session);
    });
    
    Object.entries(quizGroups).forEach(([key, group]) => {
      if (group.length > 1) {
        this.logIssue('DUPLICATE_QUIZ', 
          `Found ${group.length} quiz sessions for same user/type/date: ${key}`, 
          group.map(s => ({ id: s.id, test_type: s.test_type, created_at: s.created_at }))
        );
        this.summary.dataInconsistencies += group.length - 1;
      }
    });
  }

  // 9. Generate comprehensive report
  generateReport() {
    console.log('\n📊 COMPREHENSIVE TABLE SYNC REPORT');
    console.log('=' * 60);
    
    console.log('\n📈 TABLE COUNTS:');
    console.log(`• Profiles: ${this.summary.profiles}`);
    console.log(`• BLS Results: ${this.summary.blsResults}`);
    console.log(`• Checklist Results: ${this.summary.checklistResults}`);
    console.log(`• Quiz Sessions: ${this.summary.quizSessions}`);
    console.log(`• Checklist Items: ${this.summary.checklistItems}`);
    console.log(`• Questions: ${this.summary.questions}`);
    
    console.log('\n⚠️  ISSUES FOUND:');
    console.log(`• Orphaned Records: ${this.summary.orphanedRecords}`);
    console.log(`• Missing References: ${this.summary.missingReferences}`);
    console.log(`• Data Inconsistencies: ${this.summary.dataInconsistencies}`);
    console.log(`• Total Issues: ${this.issues.length}`);
    
    if (this.issues.length > 0) {
      console.log('\n🔍 DETAILED ISSUES:');
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.type}: ${issue.description}`);
        if (issue.data && Array.isArray(issue.data) && issue.data.length <= 5) {
          issue.data.forEach(item => console.log(`   - ${JSON.stringify(item)}`));
        }
      });
    } else {
      console.log('\n🎉 All tables are perfectly synced! No issues found.');
    }
    
    // Generate recommendations
    console.log('\n🛠️  RECOMMENDATIONS:');
    if (this.summary.orphanedRecords > 0) {
      console.log('• Clean up orphaned records using cleanup scripts');
    }
    if (this.summary.missingReferences > 0) {
      console.log('• Investigate missing cross-table references');
    }
    if (this.summary.dataInconsistencies > 0) {
      console.log('• Remove duplicate entries');
    }
    if (this.issues.some(i => i.type.includes('INCOMPLETE'))) {
      console.log('• Complete missing essential data in profiles and reference tables');
    }
    if (this.issues.some(i => i.type.includes('INVALID'))) {
      console.log('• Fix invalid data types and values');
    }
  }

  // Main verification function
  async verifyAllTables() {
    console.log('🚀 Starting Comprehensive Table Sync Verification...\n');
    
    try {
      // Check each table
      const profiles = await this.checkProfiles();
      const blsResults = await this.checkBLSResults(profiles);
      const checklistResults = await this.checkChecklistResults(profiles);
      const quizSessions = await this.checkQuizSessions(profiles);
      const checklistItems = await this.checkChecklistItems();
      const questions = await this.checkQuestions();
      
      // Cross-table integrity checks
      await this.checkCrossTableIntegrity(profiles, blsResults, checklistResults, quizSessions, checklistItems, questions);
      
      // Check for duplicates
      await this.checkDuplicates(blsResults, checklistResults, quizSessions);
      
      // Generate report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Verification failed:', error);
      this.logIssue('VERIFICATION_ERROR', 'Comprehensive verification failed', error);
    }
  }
}

// Run the comprehensive verification
const checker = new TableSyncChecker();
checker.verifyAllTables().catch(console.error);

export default TableSyncChecker;
