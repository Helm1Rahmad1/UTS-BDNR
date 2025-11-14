# Backup MongoDB database to JSON files (easier to share than BSON)
$dbName = "thriftstyle"
$backupDir = "database_backup"
$mongoUri = "mongodb://localhost:27017"

Write-Host "Creating database backup..." -ForegroundColor Green

# Create backup directory
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# Collections to backup
$collections = @("brands", "categories", "users", "products", "reviews", "offers")

foreach ($collection in $collections) {
    Write-Host "Backing up $collection..." -ForegroundColor Yellow
    
    # Try to find mongoexport
    $mongoexport = $null
    $paths = @(
        "C:\Program Files\MongoDB\Tools\100\bin\mongoexport.exe",
        "C:\Program Files\MongoDB\Server\7.0\bin\mongoexport.exe",
        "C:\Program Files\MongoDB\Server\6.0\bin\mongoexport.exe",
        "C:\Program Files\MongoDB\Server\5.0\bin\mongoexport.exe"
    )
    
    foreach ($path in $paths) {
        if (Test-Path $path) {
            $mongoexport = $path
            break
        }
    }
    
    if ($mongoexport) {
        $outputFile = Join-Path $backupDir "$collection.json"
        & $mongoexport --uri="$mongoUri" --db=$dbName --collection=$collection --out=$outputFile --jsonArray
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ $collection backed up" -ForegroundColor Green
        } else {
            Write-Host "✗ Failed to backup $collection" -ForegroundColor Red
        }
    } else {
        Write-Host "✗ mongoexport not found" -ForegroundColor Red
        Write-Host "Install MongoDB Database Tools from: https://www.mongodb.com/try/download/database-tools" -ForegroundColor Cyan
        exit 1
    }
}

Write-Host ""
Write-Host "Done! Backup completed!" -ForegroundColor Green
Write-Host "Files saved in: $backupDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "To restore on another machine:" -ForegroundColor Yellow
Write-Host "  npm run restore" -ForegroundColor White
