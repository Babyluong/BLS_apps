# PowerShell Script to Prepare Files for GitHub Upload
# This script will create a clean folder with only the files needed for GitHub

Write-Host "🚀 Preparing BLS project for GitHub upload..." -ForegroundColor Green

# Create a clean upload folder
$uploadFolder = "bls-github-upload"
if (Test-Path $uploadFolder) {
    Remove-Item $uploadFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $uploadFolder

Write-Host "📁 Creating clean project structure..." -ForegroundColor Yellow

# Copy main application files
Copy-Item "App.js" $uploadFolder\
Copy-Item "constants.js" $uploadFolder\
Copy-Item "package.json" $uploadFolder\
Copy-Item "package-lock.json" $uploadFolder\
Copy-Item "app.json" $uploadFolder\
Copy-Item "eas.json" $uploadFolder\
Copy-Item "README.md" $uploadFolder\
Copy-Item ".gitignore" $uploadFolder\
Copy-Item "PROJECT_STRUCTURE.md" $uploadFolder\

# Copy src folder
Copy-Item "src" $uploadFolder\ -Recurse

# Copy scripts folder
Copy-Item "scripts" $uploadFolder\ -Recurse

# Copy assets folder
if (Test-Path "assets") {
    Copy-Item "assets" $uploadFolder\ -Recurse
}

# Copy lib folder if it exists
if (Test-Path "lib") {
    Copy-Item "lib" $uploadFolder\ -Recurse
}

# Copy any important documentation files
$docFiles = @("BLS_APP_UPDATE_SUCCESS.md", "BLS_COMBINATION_README.md", "BLS_COMBINATION_SUCCESS.md", "MIGRATION_COMPLETE_SUMMARY.md", "REFACTORING_SUMMARY.md")
foreach ($doc in $docFiles) {
    if (Test-Path $doc) {
        Copy-Item $doc $uploadFolder\
    }
}

Write-Host "✅ Files prepared for upload!" -ForegroundColor Green
Write-Host "📂 Upload folder created: $uploadFolder" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to https://github.com/new" -ForegroundColor White
Write-Host "2. Create a new repository (e.g., 'bls-training-app')" -ForegroundColor White
Write-Host "3. Upload all files from the '$uploadFolder' folder" -ForegroundColor White
Write-Host "4. Or drag and drop the entire '$uploadFolder' folder contents" -ForegroundColor White
Write-Host ""
Write-Host "Files to upload:" -ForegroundColor Yellow
Get-ChildItem $uploadFolder -Recurse | ForEach-Object {
    Write-Host "  - $($_.FullName.Replace((Get-Location).Path + '\' + $uploadFolder + '\', ''))" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎉 Ready for GitHub upload!" -ForegroundColor Green

