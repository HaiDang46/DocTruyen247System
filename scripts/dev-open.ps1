$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot

function Test-PortInUse {
  param([int]$Port)

  try {
    $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    return $null -ne $connection
  } catch {
    return $false
  }
}

$port = 3000
while ((Test-PortInUse -Port $port) -and $port -lt 3010) {
  Write-Host "Port $port dang duoc su dung, thu port $($port + 1) ..."
  $port++
}

$hostUrl = "http://localhost:$port"

Set-Location $projectRoot

Write-Host "Starting DocTruyen247 on $hostUrl ..."

$nextCachePath = Join-Path $projectRoot ".next"
if (Test-Path -LiteralPath $nextCachePath) {
  Write-Host "Clearing Next.js cache ..."
  Remove-Item -LiteralPath $nextCachePath -Recurse -Force
}

$nextArgs = @("next", "dev", "-p", "$port")
$process = Start-Process -FilePath "npx.cmd" -ArgumentList $nextArgs -WorkingDirectory $projectRoot -NoNewWindow -PassThru

$opened = $false
for ($i = 0; $i -lt 60; $i++) {
  if ($process.HasExited) {
    exit $process.ExitCode
  }

  try {
    $response = Invoke-WebRequest -Uri $hostUrl -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
      Start-Process $hostUrl
      $opened = $true
      break
    }
  } catch {
    Start-Sleep -Milliseconds 500
  }
}

if (-not $opened) {
  Write-Host "Server is still starting. Open this URL manually if needed: $hostUrl"
}

try {
  Wait-Process -Id $process.Id
} finally {
  if (-not $process.HasExited) {
    Stop-Process -Id $process.Id -Force
  }
}
