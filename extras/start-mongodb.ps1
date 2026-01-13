# MongoDB Startup Script for Windows

Write-Host "🚀 Starting MongoDB..." -ForegroundColor Cyan

# MongoDB paths
$mongoPath = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"
$dataPath = "$env:USERPROFILE\mongodb-data"
$logPath = "$env:USERPROFILE\mongodb-data\mongod.log"

# Create data directory if it doesn't exist
if (-not (Test-Path $dataPath)) {
    Write-Host "📁 Creating MongoDB data directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $dataPath -Force | Out-Null
}

# Check if MongoDB is already running
$mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
if ($mongoProcess) {
    Write-Host "✅ MongoDB is already running!" -ForegroundColor Green
    Write-Host "   Process ID: $($mongoProcess.Id)" -ForegroundColor Gray
    exit 0
}

# Start MongoDB
Write-Host "🔄 Starting MongoDB server..." -ForegroundColor Yellow
Write-Host "   Data directory: $dataPath" -ForegroundColor Gray
Write-Host "   Log file: $logPath" -ForegroundColor Gray
Write-Host ""

try {
    Start-Process -FilePath $mongoPath -ArgumentList "--dbpath `"$dataPath`" --logpath `"$logPath`"" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    
    # Verify it started
    $mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
    if ($mongoProcess) {
        Write-Host "✅ MongoDB started successfully!" -ForegroundColor Green
        Write-Host "   Connection: mongodb://localhost:27017" -ForegroundColor Cyan
        Write-Host "   Process ID: $($mongoProcess.Id)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "💡 To stop MongoDB, run: Stop-Process -Name mongod" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Failed to start MongoDB" -ForegroundColor Red
        Write-Host "   Check the log file: $logPath" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error starting MongoDB: $_" -ForegroundColor Red
}
