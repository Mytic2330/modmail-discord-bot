# Check if Node.js is installed
try {
    $nodeVersion = node -v
} catch {
    Write-Output "Node.js is not installed. Please install Node.js to continue."
    exit 1
}

# Check if Node.js version is above 20
$nodeVersion = $nodeVersion -replace 'v', ''
$nodeMajorVersion = $nodeVersion.Split('.')[0]

if ([int]$nodeMajorVersion -lt 20) {
    Write-Output "Node.js version is below 20. Please update Node.js to version 20 or above."
    exit 1
}

Write-Output "Installing required npm modules..."
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Output "Compiling the program..."
    npm run compile

    if ($LASTEXITCODE -eq 0) {
        Write-Output "Starting the compiled version..."
        Set-Location -Path "dist"
        node index.js
    }
}