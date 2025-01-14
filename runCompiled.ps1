if (Test-Path -Path "dist/index.js") {
    Write-Output "Starting the compiled version..."
    Set-Location -Path "dist"
    node index.js
} else {
    Write-Output "Compiled version not found. Please compile the program first."
}