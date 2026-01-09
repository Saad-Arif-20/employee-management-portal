# Pre-Upload Verification Script
# Run this before uploading to Azure DevOps

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Azure DevOps Upload Verification" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$errors = 0
$warnings = 0

# Check 1: Verify .gitignore exists
Write-Host "Checking .gitignore..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    Write-Host "✅ .gitignore found" -ForegroundColor Green
}
else {
    Write-Host "❌ .gitignore NOT found!" -ForegroundColor Red
    $errors++
}

# Check 2: Verify .env is in .gitignore
Write-Host "`nChecking if .env is ignored..." -ForegroundColor Yellow
$gitignoreContent = Get-Content ".gitignore" -Raw
if ($gitignoreContent -match "\.env") {
    Write-Host "✅ .env is in .gitignore" -ForegroundColor Green
}
else {
    Write-Host "❌ .env is NOT in .gitignore!" -ForegroundColor Red
    $errors++
}

# Check 3: Verify node_modules is in .gitignore
Write-Host "`nChecking if node_modules is ignored..." -ForegroundColor Yellow
if ($gitignoreContent -match "node_modules") {
    Write-Host "✅ node_modules is in .gitignore" -ForegroundColor Green
}
else {
    Write-Host "❌ node_modules is NOT in .gitignore!" -ForegroundColor Red
    $errors++
}

# Check 4: Check for .env files
Write-Host "`nScanning for .env files..." -ForegroundColor Yellow
$envFiles = Get-ChildItem -Path . -Filter ".env" -Recurse -File -ErrorAction SilentlyContinue
if ($envFiles) {
    Write-Host "⚠️  Found .env files (these should NOT be uploaded):" -ForegroundColor Yellow
    foreach ($file in $envFiles) {
        Write-Host "   - $($file.FullName)" -ForegroundColor Yellow
    }
    Write-Host "   Make sure .gitignore is working!" -ForegroundColor Yellow
    $warnings++
}
else {
    Write-Host "✅ No .env files found in scan" -ForegroundColor Green
}

# Check 5: Verify .env.example exists
Write-Host "`nChecking for .env.example..." -ForegroundColor Yellow
if (Test-Path "server\.env.example") {
    Write-Host "✅ server\.env.example found (good for team reference)" -ForegroundColor Green
}
else {
    Write-Host "⚠️  server\.env.example NOT found" -ForegroundColor Yellow
    $warnings++
}

# Check 6: Check for large node_modules
Write-Host "`nChecking for node_modules directories..." -ForegroundColor Yellow
$nodeModules = Get-ChildItem -Path . -Filter "node_modules" -Directory -Recurse -ErrorAction SilentlyContinue
if ($nodeModules) {
    Write-Host "⚠️  Found node_modules directories:" -ForegroundColor Yellow
    foreach ($dir in $nodeModules) {
        Write-Host "   - $($dir.FullName)" -ForegroundColor Yellow
    }
    Write-Host "   These should be ignored by .gitignore" -ForegroundColor Yellow
    $warnings++
}
else {
    Write-Host "✅ No node_modules directories found" -ForegroundColor Green
}

# Check 7: Verify README exists
Write-Host "`nChecking for README.md..." -ForegroundColor Yellow
if (Test-Path "README.md") {
    Write-Host "✅ README.md found" -ForegroundColor Green
}
else {
    Write-Host "⚠️  README.md NOT found" -ForegroundColor Yellow
    $warnings++
}

# Check 8: Check for package.json files
Write-Host "`nChecking for package.json files..." -ForegroundColor Yellow
$packageFiles = Get-ChildItem -Path . -Filter "package.json" -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "node_modules" }
if ($packageFiles) {
    Write-Host "✅ Found package.json files:" -ForegroundColor Green
    foreach ($file in $packageFiles) {
        Write-Host "   - $($file.FullName)" -ForegroundColor Green
    }
}
else {
    Write-Host "❌ No package.json files found!" -ForegroundColor Red
    $errors++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Verification Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "`n✅ All checks passed! Ready to upload to Azure DevOps!" -ForegroundColor Green
}
elseif ($errors -eq 0) {
    Write-Host "`n⚠️  $warnings warning(s) found. Review above." -ForegroundColor Yellow
    Write-Host "You can proceed, but check the warnings." -ForegroundColor Yellow
}
else {
    Write-Host "`n❌ $errors error(s) and $warnings warning(s) found!" -ForegroundColor Red
    Write-Host "Please fix the errors before uploading." -ForegroundColor Red
}

Write-Host "`n========================================`n" -ForegroundColor Cyan

# Additional Info
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Review any errors or warnings above" -ForegroundColor White
Write-Host "2. Read AZURE_DEVOPS_UPLOAD_GUIDE.md for detailed instructions" -ForegroundColor White
Write-Host "3. Use Git to commit and push to Azure DevOps" -ForegroundColor White
Write-Host "`n"
