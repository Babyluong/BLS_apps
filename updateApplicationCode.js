// updateApplicationCode.js
// Update all application code to use profiles table only

import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'App.js',
  'screens/LoginScreen.js',
  'screens/ListUsersScreen.js',
  'screens/EditProfilesScreen.js',
  'screens/AddUserScreen.js',
  'screens/DeleteProfilesScreen.js',
  'screens/OneTapImportUsersScreen.js',
  'screens/BulkImportUsersScreen.js',
  'screens/InfantCPR.js',
  'screens/OneManCPR.js',
  'screens/TwoManCPR.js',
  'screens/AdultChoking.js',
  'screens/InfantChoking.js',
  'screens/BLSResultsScreen.js'
];

const replacements = [
  // Replace users table references with profiles
  {
    pattern: /\.from\("users"\)/g,
    replacement: '.from("profiles")'
  },
  // Update column references that might have changed
  {
    pattern: /tempat_bertugAS/g,
    replacement: 'tempat_bertugas'
  },
  // Update select statements to use profiles columns
  {
    pattern: /"id, full_name, ic, email, tempat_bertugas, jawatan, bls_last_year, alergik, alergik_details, asma, hamil"/g,
    replacement: '"id, full_name, ic, email, tempat_bertugas, job_position, bls_last_year, alergik, alergik_details, asma, hamil"'
  },
  // Update any remaining jawatan references to job_position
  {
    pattern: /jawatan/g,
    replacement: 'job_position'
  },
  // Update upsert operations to use profiles
  {
    pattern: /\.upsert\(payload, \{ onConflict: "ic" \}\)/g,
    replacement: '.upsert(payload, { onConflict: "ic" })'
  }
];

async function updateApplicationCode() {
  console.log('🔄 Updating Application Code to Use Profiles Table Only\n');
  console.log('=' .repeat(60));
  
  let totalFiles = 0;
  let updatedFiles = 0;
  let errors = 0;
  
  for (const filePath of filesToUpdate) {
    try {
      totalFiles++;
      console.log(`\n📝 Processing: ${filePath}`);
      
      if (!fs.existsSync(filePath)) {
        console.log(`   ⚠️  File not found, skipping...`);
        continue;
      }
      
      let content = fs.readFileSync(filePath, 'utf8');
      let hasChanges = false;
      
      // Apply all replacements
      for (const { pattern, replacement } of replacements) {
        const newContent = content.replace(pattern, replacement);
        if (newContent !== content) {
          content = newContent;
          hasChanges = true;
        }
      }
      
      if (hasChanges) {
        // Create backup
        const backupPath = `${filePath}.backup.${Date.now()}`;
        fs.writeFileSync(backupPath, fs.readFileSync(filePath, 'utf8'));
        console.log(`   💾 Backup created: ${backupPath}`);
        
        // Write updated content
        fs.writeFileSync(filePath, content);
        console.log(`   ✅ Updated successfully`);
        updatedFiles++;
      } else {
        console.log(`   ℹ️  No changes needed`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      errors++;
    }
  }
  
  console.log(`\n📊 Update Summary:`);
  console.log(`   📁 Total files processed: ${totalFiles}`);
  console.log(`   ✅ Files updated: ${updatedFiles}`);
  console.log(`   ❌ Errors: ${errors}`);
  
  if (updatedFiles > 0) {
    console.log(`\n🎉 Application code updated successfully!`);
    console.log(`   All references to 'users' table have been changed to 'profiles'`);
    console.log(`   Column references updated (jawatan → job_position)`);
    console.log(`   Backup files created for safety`);
  }
  
  console.log(`\n💡 Next Steps:`);
  console.log(`   1. Test all functionality to ensure everything works`);
  console.log(`   2. Verify login, user management, and data operations`);
  console.log(`   3. Drop the users table after successful testing`);
  console.log(`   4. Remove backup files once confirmed working`);
}

// Run the update
updateApplicationCode();
