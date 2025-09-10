// analyzeSupabaseTables.js
// Script to analyze your Supabase tables and provide recommendations

import { createClient } from '@supabase/supabase-js';

// Your Supabase credentials
const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Tables that are actively used in your application
const ACTIVE_TABLES = {
  // Core user management
  'profiles': {
    purpose: 'User profiles and authentication data',
    usage: 'Heavy - used for login, role management, user info',
    priority: 'CRITICAL',
    canRemove: false
  },
  'users': {
    purpose: 'Participant/student data (separate from auth profiles)',
    usage: 'Heavy - used for participant management, results display',
    priority: 'CRITICAL',
    canRemove: false
  },
  
  // Quiz and assessment data
  'quiz_sessions': {
    purpose: 'Quiz test sessions (pre-test and post-test)',
    usage: 'Heavy - core functionality for BLS testing',
    priority: 'CRITICAL',
    canRemove: false
  },
  'questions': {
    purpose: 'Quiz questions and answers',
    usage: 'Heavy - used for quiz generation and scoring',
    priority: 'CRITICAL',
    canRemove: false
  },
  
  // Results and tracking
  'bls_results': {
    purpose: 'BLS assessment results and scores',
    usage: 'Heavy - main results storage',
    priority: 'CRITICAL',
    canRemove: false
  },
  'checklist_results': {
    purpose: 'Individual checklist practice results',
    usage: 'Medium - used for detailed assessment tracking',
    priority: 'IMPORTANT',
    canRemove: false
  },
  
  // Activity and logging
  'activity_logs': {
    purpose: 'System activity logging and audit trail',
    usage: 'Medium - used for admin monitoring',
    priority: 'IMPORTANT',
    canRemove: false
  }
};

// Tables that might be unused or redundant
const POTENTIALLY_UNUSED_TABLES = [
  // Add any tables you suspect might be unused
  // These will be checked against actual usage
];

async function analyzeTables() {
  console.log('🔍 Analyzing Supabase Tables for BLS Application\n');
  console.log('=' .repeat(60));
  
  try {
    // 1. Get all tables in the database using RPC
    console.log('\n📋 Step 1: Discovering all tables...');
    
    // Try to get tables using RPC function
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables');
    
    let allTables = [];
    
    if (tablesError) {
      console.log('⚠️ RPC method failed, trying alternative approach...');
      
      // Alternative: Try to query each known table to see which exist
      const knownTables = [
        'profiles', 'users', 'quiz_sessions', 'questions', 
        'bls_results', 'checklist_results', 'activity_logs',
        'participants', 'staff', 'results', 'sessions'
      ];
      
      const existingTables = [];
      
      for (const tableName of knownTables) {
        try {
          const { error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (!error) {
            existingTables.push(tableName);
          }
        } catch (e) {
          // Table doesn't exist or no access
        }
      }
      
      allTables = existingTables;
    } else {
      allTables = tables || [];
    }
    
    console.log(`✅ Found ${allTables.length} tables:`, allTables);
    
    // 2. Analyze each table
    console.log('\n📊 Step 2: Analyzing table usage and data...\n');
    
    const analysisResults = {};
    
    for (const tableName of allTables) {
      console.log(`\n🔍 Analyzing table: ${tableName}`);
      console.log('-'.repeat(40));
      
      try {
        // Get row count
        const { count, error: countError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.log(`❌ Error counting rows: ${countError.message}`);
          analysisResults[tableName] = {
            rowCount: 'Error',
            status: 'ERROR',
            canRemove: false,
            reason: 'Cannot access table'
          };
          continue;
        }
        
        // Get sample data to understand structure
        const { data: sampleData, error: sampleError } = await supabase
          .from(tableName)
          .select('*')
          .limit(3);
        
        if (sampleError) {
          console.log(`❌ Error getting sample data: ${sampleError.message}`);
          analysisResults[tableName] = {
            rowCount: count || 0,
            status: 'ERROR',
            canRemove: false,
            reason: 'Cannot access sample data'
          };
          continue;
        }
        
        // Determine if table is actively used
        const isActiveTable = ACTIVE_TABLES[tableName];
        const hasData = (count || 0) > 0;
        
        let recommendation = '';
        let canRemove = false;
        let priority = 'UNKNOWN';
        
        if (isActiveTable) {
          priority = isActiveTable.priority;
          canRemove = isActiveTable.canRemove;
          recommendation = `✅ ACTIVE - ${isActiveTable.purpose}`;
        } else {
          // Check if table has data
          if (!hasData) {
            canRemove = true;
            recommendation = '🗑️ CAN REMOVE - No data and not in active tables list';
            priority = 'LOW';
          } else {
            canRemove = false;
            recommendation = '⚠️ UNKNOWN - Has data but not in active tables list';
            priority = 'MEDIUM';
          }
        }
        
        console.log(`   Rows: ${count || 0}`);
        console.log(`   Priority: ${priority}`);
        console.log(`   Recommendation: ${recommendation}`);
        console.log(`   Can Remove: ${canRemove ? 'YES' : 'NO'}`);
        
        if (sampleData && sampleData.length > 0) {
          console.log(`   Sample columns: ${Object.keys(sampleData[0]).join(', ')}`);
        }
        
        analysisResults[tableName] = {
          rowCount: count || 0,
          status: hasData ? 'HAS_DATA' : 'EMPTY',
          canRemove,
          priority,
          recommendation,
          columns: sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : []
        };
        
      } catch (error) {
        console.log(`❌ Error analyzing table ${tableName}:`, error.message);
        analysisResults[tableName] = {
          rowCount: 'Error',
          status: 'ERROR',
          canRemove: false,
          reason: error.message
        };
      }
    }
    
    // 3. Generate summary and recommendations
    console.log('\n\n📋 SUMMARY AND RECOMMENDATIONS');
    console.log('=' .repeat(60));
    
    const criticalTables = Object.entries(analysisResults)
      .filter(([_, analysis]) => analysis.priority === 'CRITICAL')
      .map(([name, _]) => name);
    
    const importantTables = Object.entries(analysisResults)
      .filter(([_, analysis]) => analysis.priority === 'IMPORTANT')
      .map(([name, _]) => name);
    
    const removableTables = Object.entries(analysisResults)
      .filter(([_, analysis]) => analysis.canRemove)
      .map(([name, analysis]) => ({ name, ...analysis }));
    
    const unknownTables = Object.entries(analysisResults)
      .filter(([_, analysis]) => analysis.priority === 'UNKNOWN' || analysis.priority === 'MEDIUM')
      .map(([name, analysis]) => ({ name, ...analysis }));
    
    console.log('\n🔴 CRITICAL TABLES (DO NOT REMOVE):');
    criticalTables.forEach(table => {
      const analysis = analysisResults[table];
      console.log(`   ✅ ${table} - ${analysis.rowCount} rows - ${analysis.recommendation}`);
    });
    
    console.log('\n🟡 IMPORTANT TABLES (KEEP):');
    importantTables.forEach(table => {
      const analysis = analysisResults[table];
      console.log(`   ✅ ${table} - ${analysis.rowCount} rows - ${analysis.recommendation}`);
    });
    
    if (removableTables.length > 0) {
      console.log('\n🗑️ TABLES YOU CAN SAFELY REMOVE:');
      removableTables.forEach(({ name, rowCount, recommendation }) => {
        console.log(`   ❌ ${name} - ${rowCount} rows - ${recommendation}`);
      });
    } else {
      console.log('\n✅ No tables identified for removal - all tables appear to be in use.');
    }
    
    if (unknownTables.length > 0) {
      console.log('\n⚠️ TABLES NEEDING REVIEW:');
      unknownTables.forEach(({ name, rowCount, recommendation, columns }) => {
        console.log(`   ❓ ${name} - ${rowCount} rows`);
        console.log(`      ${recommendation}`);
        if (columns.length > 0) {
          console.log(`      Columns: ${columns.join(', ')}`);
        }
      });
    }
    
    // 4. Generate cleanup script
    if (removableTables.length > 0) {
      console.log('\n\n🛠️ CLEANUP SCRIPT:');
      console.log('=' .repeat(60));
      console.log('-- Run this SQL in your Supabase SQL editor to remove unused tables:');
      console.log('');
      
      removableTables.forEach(({ name }) => {
        console.log(`-- Remove table: ${name}`);
        console.log(`DROP TABLE IF EXISTS ${name} CASCADE;`);
        console.log('');
      });
    }
    
    // 5. Database optimization recommendations
    console.log('\n\n💡 OPTIMIZATION RECOMMENDATIONS:');
    console.log('=' .repeat(60));
    
    const tablesWithData = Object.entries(analysisResults)
      .filter(([_, analysis]) => analysis.rowCount > 0);
    
    if (tablesWithData.length > 0) {
      console.log('1. Consider adding indexes on frequently queried columns:');
      console.log('   - user_id columns for foreign key lookups');
      console.log('   - created_at columns for date-based queries');
      console.log('   - status columns for filtering');
      
      console.log('\n2. Consider archiving old data:');
      console.log('   - Move old activity_logs to archive table');
      console.log('   - Archive completed quiz_sessions older than 1 year');
      
      console.log('\n3. Monitor table sizes:');
      tablesWithData.forEach(([name, analysis]) => {
        if (analysis.rowCount > 10000) {
          console.log(`   - ${name}: ${analysis.rowCount} rows (consider archiving)`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

// Run the analysis
analyzeTables();
