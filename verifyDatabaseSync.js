// Database Sync Verification Script
// This script checks all Supabase tables for consistency and sync issues
// Excludes admin and staff from profile table checks

import supabase from './services/supabase.js';

class DatabaseSyncVerifier {
  constructor() {
    this.issues = [];
    this.summary = {
      profilesChecked: 0,
      blsResultsChecked: 0,
      checklistResultsChecked: 0,
      quizSessionsChecked: 0,
      orphanedRecords: 0,
      missingReferences: 0,
      duplicateEntries: 0
    };
  }

  // Log issues found during verification
  logIssue(type, description, data = null) {
    this.issues.push({
      type,
      description,
      data,
      timestamp: new Date().toISOString()
    });
    console.warn(`⚠️  ${type}: ${description}`, data || '');
  }

  // Get all profiles excluding admin and staff
  async getActiveProfiles() {
    console.log('🔍 Fetching active profiles (excluding admin and staff)...');
    
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .not('role', 'in', '("admin","staff")');

    if (error) {
      this.logIssue('FETCH_ERROR', 'Failed to fetch profiles', error);
      return [];
    }

    this.summary.profilesChecked = profiles?.length || 0;
    console.log(`✅ Found ${this.summary.profilesChecked} active profiles`);
    return profiles || [];
  }

  // Check BLS Results table
  async checkBLSResults(profiles) {
    console.log('🔍 Checking BLS Results table...');
    
    const { data: blsResults, error } = await supabase
      .from('bls_results')
      .select('*');

    if (error) {
      this.logIssue('FETCH_ERROR', 'Failed to fetch BLS results', error);
      return [];
    }

    this.summary.blsResultsChecked = blsResults?.length || 0;
    
    // Check for orphaned BLS results (user_id not in active profiles)
    const activeUserIds = new Set(profiles.map(p => p.id));
    const orphanedBLS = blsResults.filter(result => !activeUserIds.has(result.user_id));
    
    if (orphanedBLS.length > 0) {
      this.logIssue('ORPHANED_RECORDS', `Found ${orphanedBLS.length} BLS results with no matching profile`, orphanedBLS);
      this.summary.orphanedRecords += orphanedBLS.length;
    }

    // Check for missing jawatan data
    const missingJawatan = blsResults.filter(result => !result.jawatan || result.jawatan === 'Unknown Position');
    if (missingJawatan.length > 0) {
      this.logIssue('MISSING_DATA', `Found ${missingJawatan.length} BLS results missing jawatan data`, missingJawatan);
    }

    console.log(`✅ Checked ${this.summary.blsResultsChecked} BLS results`);
    return blsResults || [];
  }

  // Check Checklist Results table
  async checkChecklistResults(profiles) {
    console.log('🔍 Checking Checklist Results table...');
    
    const { data: checklistResults, error } = await supabase
      .from('checklist_results')
      .select('*');

    if (error) {
      this.logIssue('FETCH_ERROR', 'Failed to fetch checklist results', error);
      return [];
    }

    this.summary.checklistResultsChecked = checklistResults?.length || 0;
    
    // Check for orphaned checklist results
    const activeUserIds = new Set(profiles.map(p => p.id));
    const orphanedChecklist = checklistResults.filter(result => !activeUserIds.has(result.user_id));
    
    if (orphanedChecklist.length > 0) {
      this.logIssue('ORPHANED_RECORDS', `Found ${orphanedChecklist.length} checklist results with no matching profile`, orphanedChecklist);
      this.summary.orphanedRecords += orphanedChecklist.length;
    }

    console.log(`✅ Checked ${this.summary.checklistResultsChecked} checklist results`);
    return checklistResults || [];
  }

  // Check Quiz Sessions table
  async checkQuizSessions(profiles) {
    console.log('🔍 Checking Quiz Sessions table...');
    
    const { data: quizSessions, error } = await supabase
      .from('quiz_sessions')
      .select('*');

    if (error) {
      this.logIssue('FETCH_ERROR', 'Failed to fetch quiz sessions', error);
      return [];
    }

    this.summary.quizSessionsChecked = quizSessions?.length || 0;
    
    // Check for orphaned quiz sessions
    const activeUserIds = new Set(profiles.map(p => p.id));
    const orphanedQuiz = quizSessions.filter(session => !activeUserIds.has(session.user_id));
    
    if (orphanedQuiz.length > 0) {
      this.logIssue('ORPHANED_RECORDS', `Found ${orphanedQuiz.length} quiz sessions with no matching profile`, orphanedQuiz);
      this.summary.orphanedRecords += orphanedQuiz.length;
    }

    console.log(`✅ Checked ${this.summary.quizSessionsChecked} quiz sessions`);
    return quizSessions || [];
  }

  // Check for duplicate entries
  async checkDuplicates(blsResults, checklistResults, quizSessions) {
    console.log('🔍 Checking for duplicate entries...');
    
    // Check for duplicate BLS results (same user, same date)
    const blsGroups = {};
    blsResults.forEach(result => {
      const key = `${result.user_id}_${result.created_at?.split('T')[0]}`;
      if (!blsGroups[key]) blsGroups[key] = [];
      blsGroups[key].push(result);
    });
    
    Object.entries(blsGroups).forEach(([key, group]) => {
      if (group.length > 1) {
        this.logIssue('DUPLICATE_ENTRIES', `Found ${group.length} BLS results for same user/date: ${key}`, group);
        this.summary.duplicateEntries += group.length - 1;
      }
    });
  }

  // Check data integrity between tables
  async checkDataIntegrity(profiles, blsResults, checklistResults, quizSessions) {
    console.log('🔍 Checking data integrity between tables...');
    
    // Check if users with BLS results have corresponding checklist results
    const usersWithBLS = new Set(blsResults.map(r => r.user_id));
    const usersWithChecklist = new Set(checklistResults.map(r => r.user_id));
    
    const missingChecklist = [...usersWithBLS].filter(userId => !usersWithChecklist.has(userId));
    if (missingChecklist.length > 0) {
      this.logIssue('MISSING_REFERENCES', `Found ${missingChecklist.length} users with BLS results but no checklist results`, missingChecklist);
      this.summary.missingReferences += missingChecklist.length;
    }
  }

  // Generate cleanup SQL for orphaned records
  generateCleanupSQL() {
    console.log('📝 Generating cleanup SQL...');
    
    const cleanupSQL = [];
    
    // Find orphaned records and generate delete statements
    this.issues.forEach(issue => {
      if (issue.type === 'ORPHANED_RECORDS' && issue.data) {
        if (issue.description.includes('BLS results')) {
          const ids = issue.data.map(r => r.id);
          cleanupSQL.push(`-- Delete orphaned BLS results\nDELETE FROM bls_results WHERE id IN (${ids.join(', ')});`);
        }
        if (issue.description.includes('checklist results')) {
          const ids = issue.data.map(r => r.id);
          cleanupSQL.push(`-- Delete orphaned checklist results\nDELETE FROM checklist_results WHERE id IN (${ids.join(', ')});`);
        }
        if (issue.description.includes('quiz sessions')) {
          const ids = issue.data.map(r => r.id);
          cleanupSQL.push(`-- Delete orphaned quiz sessions\nDELETE FROM quiz_sessions WHERE id IN (${ids.join(', ')});`);
        }
      }
    });

    return cleanupSQL;
  }

  // Main verification function
  async verifyDatabase() {
    console.log('🚀 Starting Database Sync Verification...\n');
    
    try {
      // Get active profiles (excluding admin and staff)
      const profiles = await this.getActiveProfiles();
      
      // Check each table
      const blsResults = await this.checkBLSResults(profiles);
      const checklistResults = await this.checkChecklistResults(profiles);
      const quizSessions = await this.checkQuizSessions(profiles);
      
      // Check for duplicates and integrity issues
      await this.checkDuplicates(blsResults, checklistResults, quizSessions);
      await this.checkDataIntegrity(profiles, blsResults, checklistResults, quizSessions);
      
      // Generate report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Verification failed:', error);
      this.logIssue('VERIFICATION_ERROR', 'Database verification failed', error);
    }
  }

  // Generate final report
  generateReport() {
    console.log('\n📊 DATABASE SYNC VERIFICATION REPORT');
    console.log('=' * 50);
    
    console.log('\n📈 SUMMARY:');
    console.log(`• Profiles checked: ${this.summary.profilesChecked}`);
    console.log(`• BLS results checked: ${this.summary.blsResultsChecked}`);
    console.log(`• Checklist results checked: ${this.summary.checklistResultsChecked}`);
    console.log(`• Quiz sessions checked: ${this.summary.quizSessionsChecked}`);
    console.log(`• Orphaned records found: ${this.summary.orphanedRecords}`);
    console.log(`• Missing references found: ${this.summary.missingReferences}`);
    console.log(`• Duplicate entries found: ${this.summary.duplicateEntries}`);
    
    console.log('\n🔍 ISSUES FOUND:');
    if (this.issues.length === 0) {
      console.log('✅ No issues found! Database is properly synced.');
    } else {
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.type}: ${issue.description}`);
      });
    }
    
    // Generate cleanup SQL if needed
    const cleanupSQL = this.generateCleanupSQL();
    if (cleanupSQL.length > 0) {
      console.log('\n🛠️  CLEANUP SQL:');
      cleanupSQL.forEach(sql => console.log(sql + '\n'));
    }
    
    console.log('\n✅ Verification completed!');
  }
}

// Run the verification
const verifier = new DatabaseSyncVerifier();
verifier.verifyDatabase().catch(console.error);

export default DatabaseSyncVerifier;
