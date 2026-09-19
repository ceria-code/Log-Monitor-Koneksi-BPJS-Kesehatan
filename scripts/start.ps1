$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$pidFile = Join-Path $root '.vite-server.pid'
$port = 3010

function Test-PortInUse {
  param([int]$Port)

  $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
  try {
    $listener.Start()
    return $false
  } catch {
    return $true
  } finally {
    $listener.Stop()
  }
}

if (Test-Path $pidFile) {
  $pidData = (Get-Content $pidFile -Raw).Trim().Split('|')
  $existingPid = [int]$pidData[0]
  if (Get-Process -Id $existingPid -ErrorAction SilentlyContinue) {
    $existingPort = if ($pidData.Count -gt 1) { [int]$pidData[1] } else { 3010 }
    $url = "http://127.0.0.1:$existingPort"
    Start-Process $url
    Write-Host "Aplikasi sudah berjalan: $url"
    exit 0
  }
  Remove-Item $pidFile -Force
}

if (-not (Test-Path (Join-Path $root 'node_modules'))) {
  Write-Host 'Dependensi belum terpasang. Menjalankan npm install...'
  Push-Location $root
  try { & npm.cmd install } finally { Pop-Location }
}

while (Test-PortInUse -Port $port) {
  $port++
}

$url = "http://127.0.0.1:$port"

$node = (Get-Command node.exe -ErrorAction Stop).Source
$vite = Join-Path $root 'node_modules\vite\bin\vite.js'
$server = Start-Process -FilePath $node `
  -ArgumentList @('"' + $vite + '"', "--port=$port", '--host=0.0.0.0') `
  -WorkingDirectory $root `
  -WindowStyle Minimized `
  -PassThru
$server.Id.ToString() + "|$port" | Set-Content -Path $pidFile -Encoding ascii

for ($attempt = 1; $attempt -le 30; $attempt++) {
  try {
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 1
    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
      Start-Process $url
      Write-Host "Aplikasi berjalan: $url"
      exit 0
    }
  } catch {
    # Server masih melakukan startup.
  }
  Start-Sleep -Milliseconds 500
}

taskkill.exe /PID $server.Id /T /F | Out-Null
Remove-Item $pidFile -Force
Write-Error "Aplikasi tidak merespons di $url. Jalankan Hentikan.bat lalu coba lagi."
exit 1