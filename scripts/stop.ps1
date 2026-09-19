$ErrorActionPreference = 'SilentlyContinue'

$root = Split-Path -Parent $PSScriptRoot
$pidFile = Join-Path $root '.vite-server.pid'

if (-not (Test-Path $pidFile)) {
  Write-Host 'Aplikasi tidak sedang berjalan.'
  exit 0
}

$serverPid = [int]((Get-Content $pidFile -Raw).Trim().Split('|')[0])
taskkill.exe /PID $serverPid /T /F | Out-Null
Remove-Item $pidFile -Force
Write-Host 'Aplikasi dan proses server turunannya sudah dihentikan.'