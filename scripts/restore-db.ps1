# Script untuk restore database dari file BSON
$dbName = "thriftstyle"
$backupPath = "C:\Users\MyBook Hype AMD\Downloads\thriftstyle\thriftstyle"
$mongoUri = "mongodb://localhost:27017"

Write-Host "Starting database restore..." -ForegroundColor Green

# Array of collections
$collections = @("brands", "categories", "orders", "products", "reviews", "users")

foreach ($collection in $collections) {
    $bsonFile = Join-Path $backupPath "$collection.bson"
    
    if (Test-Path $bsonFile) {
        Write-Host "Restoring $collection..." -ForegroundColor Yellow
        
        # Try different possible locations for mongorestore
        $mongorestore = $null
        
        # Check common installation paths
        $paths = @(
            "C:\Program Files\MongoDB\Tools\100\bin\mongorestore.exe",
            "C:\Program Files\MongoDB\Server\7.0\bin\mongorestore.exe",
            "C:\Program Files\MongoDB\Server\6.0\bin\mongorestore.exe",
            "C:\Program Files\MongoDB\Server\5.0\bin\mongorestore.exe"
        )
        
        foreach ($path in $paths) {
            if (Test-Path $path) {
                $mongorestore = $path
                break
            }
        }
        
        # If not found in common paths, search
        if (-not $mongorestore) {
            $found = Get-ChildItem "C:\Program Files\MongoDB" -Recurse -Filter "mongorestore.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($found) {
                $mongorestore = $found.FullName
            }
        }
        
        if ($mongorestore) {
            & $mongorestore --uri="$mongoUri" --db=$dbName --collection=$collection $bsonFile
            Write-Host "Success: $collection restored" -ForegroundColor Green
        } else {
            Write-Host "ERROR: mongorestore not found" -ForegroundColor Red
            Write-Host "Download from: https://www.mongodb.com/try/download/database-tools" -ForegroundColor Cyan
            exit 1
        }
    } else {
        Write-Host "ERROR: File not found - $bsonFile" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Database restore completed!" -ForegroundColor Green
Write-Host "Run npm run dev to start the application" -ForegroundColor Cyan
