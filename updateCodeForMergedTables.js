// updateCodeForMergedTables.js
// Script to help identify and update code that needs to be changed after merging tables

import fs from 'fs';
import path from 'path';

// Files that need to be updated
const filesToUpdate = [
  'App.js',
  'App-backup.js', 
  'screens/LoginScreen.js',
  'screens/BLSResultsScreen.js',
  'screens/EditProfilesScreen.js',
  'screens/AddUserScreen.js',
  'screens/ListUsersScreen.js',
  'screens/DeleteProfilesScreen.js',
  'debugLogin.js',
  'lib/api.js',
  'services/blsResultsService.js'
];

// Patterns to find and replace
const replacements = [
  // Replace .from("users") with .from("profiles")
  {
    pattern: /\.from\(['"`]users['"`]\)/g,
    replacement: '.from("profiles")',
    description: 'Replace users table references with profiles'
  },
  
  // Update specific user queries to use profiles
  {
    pattern: /\.from\(['"`]users['"`]\)\s*\.select\(['"`]full_name,\s*ic,\s*jawatan['"`]\)/g,
    replacement: '.from("profiles").select("full_name, ic, jawatan")',
    description: 'Update user selection queries'
  },
  
  // Update user data selection patterns
  {
    pattern: /\.from\(['"`]users['"`]\)\s*\.select\(['"`]id,\s*jawatan,\s*full_name,\s*ic,\s*tempat_bertugas,\s*email['"`]\)/g,
    replacement: '.from("profiles").select("id, jawatan, full_name, ic, tempat_bertugas, email")',
    description: 'Update detailed user selection queries'
  },
  
  // Update user lookup patterns
  {
    pattern: /\.from\(['"`]users['"`]\)\s*\.select\(['"`]full_name,\s*ic['"`]\)/g,
    replacement: '.from("profiles").select("full_name, ic")',
    description: 'Update basic user lookup queries'
  },
  
  // Update user management patterns
  {
    pattern: /\.from\(['"`]users['"`]\)\s*\.select\(['"`]full_name,\s*ic,\s*jawatan['"`]\)/g,
    replacement: '.from("profiles").select("full_name, ic, jawatan")',
    description: 'Update user management queries'
  }
];

function analyzeFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { exists: false, changes: [] };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const changes = [];
  
  // Check for users table references
  const userTableMatches = content.match(/\.from\(['"`]users['"`]\)/g);
  if (userTableMatches) {
    changes.push({
      type: 'users_table_reference',
      count: userTableMatches.length,
      lines: findLineNumbers(content, /\.from\(['"`]users['"`]\)/g)
    });
  }
  
  // Check for specific patterns that need updating
  replacements.forEach(({ pattern, description }) => {
    const matches = content.match(pattern);
    if (matches) {
      changes.push({
        type: 'pattern_match',
        pattern: description,
        count: matches.length,
        lines: findLineNumbers(content, pattern)
      });
    }
  });
  
  return { exists: true, changes };
}

function findLineNumbers(content, pattern) {
  const lines = content.split('\n');
  const lineNumbers = [];
  
  lines.forEach((line, index) => {
    if (pattern.test(line)) {
      lineNumbers.push(index + 1);
    }
  });
  
  return lineNumbers;
}

function generateUpdatedCode(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changeCount = 0;
  
  // Apply all replacements
  replacements.forEach(({ pattern, replacement, description }) => {
    const before = content;
    content = content.replace(pattern, replacement);
    if (content !== before) {
      changeCount++;
      console.log(`   ✅ Applied: ${description}`);
    }
  });
  
  return { content, changeCount };
}

async function analyzeAndUpdateCode() {
  console.log('🔍 Analyzing Code for Table Merge Updates\n');
  console.log('=' .repeat(60));
  
  const analysisResults = {};
  const updateResults = {};
  
  // Analyze all files
  console.log('📋 Step 1: Analyzing files for required changes...\n');
  
  for (const filePath of filesToUpdate) {
    console.log(`🔍 Analyzing ${filePath}...`);
    const analysis = analyzeFile(filePath);
    analysisResults[filePath] = analysis;
    
    if (!analysis.exists) {
      console.log(`   ⚠️  File not found`);
      continue;
    }
    
    if (analysis.changes.length === 0) {
      console.log(`   ✅ No changes needed`);
    } else {
      console.log(`   📝 Found ${analysis.changes.length} types of changes needed:`);
      analysis.changes.forEach(change => {
        if (change.type === 'users_table_reference') {
          console.log(`      • ${change.count} users table references (lines: ${change.lines.join(', ')})`);
        } else if (change.type === 'pattern_match') {
          console.log(`      • ${change.pattern}: ${change.count} matches (lines: ${change.lines.join(', ')})`);
        }
      });
    }
  }
  
  // Generate updated code
  console.log('\n📋 Step 2: Generating updated code...\n');
  
  for (const filePath of filesToUpdate) {
    if (!analysisResults[filePath]?.exists) continue;
    
    console.log(`🔄 Updating ${filePath}...`);
    const update = generateUpdatedCode(filePath);
    
    if (update && update.changeCount > 0) {
      updateResults[filePath] = update;
      console.log(`   ✅ Generated ${update.changeCount} changes`);
    } else {
      console.log(`   ✅ No changes needed`);
    }
  }
  
  // Summary
  console.log('\n📊 SUMMARY:');
  console.log('=' .repeat(60));
  
  const filesWithChanges = Object.keys(updateResults);
  console.log(`Files that need updates: ${filesWithChanges.length}`);
  console.log(`Total changes generated: ${Object.values(updateResults).reduce((sum, r) => sum + r.changeCount, 0)}`);
  
  if (filesWithChanges.length > 0) {
    console.log('\n📝 FILES TO UPDATE:');
    filesWithChanges.forEach(filePath => {
      const result = updateResults[filePath];
      console.log(`   • ${filePath} (${result.changeCount} changes)`);
    });
    
    console.log('\n🛠️ MANUAL STEPS REQUIRED:');
    console.log('1. Review each updated file carefully');
    console.log('2. Test the changes in a development environment');
    console.log('3. Update any hardcoded references to "users" table');
    console.log('4. Update any comments or documentation');
    console.log('5. Test all user-related functionality');
    
    console.log('\n⚠️  IMPORTANT NOTES:');
    console.log('• Some changes might need manual review');
    console.log('• Test login functionality thoroughly');
    console.log('• Check all user management screens');
    console.log('• Verify data consistency after changes');
  }
  
  // Generate migration checklist
  console.log('\n📋 MIGRATION CHECKLIST:');
  console.log('=' .repeat(60));
  console.log('□ 1. Run data migration script');
  console.log('□ 2. Update application code');
  console.log('□ 3. Test login functionality');
  console.log('□ 4. Test user management screens');
  console.log('□ 5. Test quiz and results functionality');
  console.log('□ 6. Verify data consistency');
  console.log('□ 7. Update any documentation');
  console.log('□ 8. Deploy to production');
  console.log('□ 9. Drop users table (after verification)');
}

// Run the analysis
analyzeAndUpdateCode();
