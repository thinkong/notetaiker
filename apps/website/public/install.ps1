#!/usr/bin/env pwsh
$ErrorActionPreference = "Stop"

$Repo = "thinkong/notetaiker"
$BaseUrl = "https://github.com/$Repo/releases/latest/download"
$AppName = "notetAIker"

function Write-Banner {
    Write-Host ""
    Write-Host "  notetAIker Installer" -ForegroundColor White
    Write-Host "  Local-first AI note taking" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Err {
    param([string]$Message)
    Write-Host "error: $Message" -ForegroundColor Red
}

function Write-Ok {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

Write-Banner

$Arch = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture
if ($Arch -ne [System.Runtime.InteropServices.Architecture]::X64) {
    Write-Err "$AppName for Windows is only available for x64 architecture."
    Write-Err "Detected architecture: $Arch"
    exit 1
}

$TempDir = Join-Path ([System.IO.Path]::GetTempPath()) "notetaiker-install-$([System.Guid]::NewGuid().ToString('N').Substring(0, 8))"

try {
    New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

    $Asset = "stable-win-x64-$AppName-Setup.zip"
    $ZipPath = Join-Path $TempDir $Asset
    $ExtractDir = Join-Path $TempDir "extracted"
    $Url = "$BaseUrl/$Asset"

    Write-Info "Downloading from $Url..."

    $ProgressPreference = "SilentlyContinue"
    Invoke-WebRequest -Uri $Url -OutFile $ZipPath -UseBasicParsing
    $ProgressPreference = "Continue"

    Write-Info "Extracting archive..."
    Expand-Archive -Path $ZipPath -DestinationPath $ExtractDir -Force

    $SetupExe = Get-ChildItem -Path $ExtractDir -Filter "*-Setup.exe" -Recurse | Select-Object -First 1

    if (-not $SetupExe) {
        Write-Err "Could not find Setup executable in the archive."
        exit 1
    }

    Write-Info "Running installer..."
    $process = Start-Process -FilePath $SetupExe.FullName -PassThru -Wait
    if ($process.ExitCode -ne 0) {
        Write-Err "Installer exited with code $($process.ExitCode)."
        exit 1
    }

    Write-Host ""
    Write-Ok "  $AppName has been installed successfully."
    Write-Host ""

} catch {
    Write-Err $_.Exception.Message
    exit 1
} finally {
    if (Test-Path $TempDir) {
        Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}
