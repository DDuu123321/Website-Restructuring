#requires -Version 5.1
<#
  pack-for-mac.ps1 — Pack the Bluven + CRM dev setup onto an external drive
  so it can be restored on a Mac (see restore-on-mac.sh).

  What it copies (build artifacts & node_modules are excluded on purpose —
  they are platform-specific and get rebuilt on the Mac):
    - bluven repo : incl. .git, .claude/ (hooks/settings/reviews/skills),
                    cms/.env, docs/, uploads/, and the gitignored working notes
    - CRM repo
    - Claude memory + chat history for this project
      (%USERPROFILE%\.claude\projects\<key>)
    - pg_dump of the `bluven` and `bluven_crm` databases (custom format)

  USAGE (Windows PowerShell, from anywhere — paths resolve off the script):
    .\scripts\pack-for-mac.ps1 -Dest "E:\bluven-migration"
    .\scripts\pack-for-mac.ps1 -Dest "E:\bluven-migration" -SkipDb

  NOTE: if the project lives in OneDrive, make sure the files are actually on
  disk first (right-click the folder -> "Always keep on this device"),
  otherwise robocopy may copy cloud-only placeholders.
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$Dest,

  [string]$PgContainer    = 'bluven-pg',
  [string]$PgUser         = 'postgres',
  [string[]]$Databases    = @('bluven', 'bluven_crm'),
  [switch]$SkipDb
)

function Info($m){ Write-Host "[pack] $m" -ForegroundColor Cyan }
function Warn($m){ Write-Host "[pack] $m" -ForegroundColor Yellow }
function Die ($m){ Write-Host "[pack] ERROR: $m" -ForegroundColor Red; exit 1 }

# --- Resolve source paths from the script location ---------------------------
$BluvenRoot = Split-Path $PSScriptRoot -Parent      # ...\my-website\bluven
$MyWebsite  = Split-Path $BluvenRoot   -Parent      # ...\my-website
$CrmRoot    = Join-Path  $MyWebsite 'CRM'

if (-not (Test-Path (Join-Path $BluvenRoot 'CLAUDE.md'))) {
  Die "Can't find the bluven repo (expected this script under bluven\scripts\)."
}

# --- Compute the Claude memory key from the bluven absolute path -------------
# Claude stores memory at %USERPROFILE%\.claude\projects\<key>, where <key> is
# the absolute project path with every non-alphanumeric char replaced by '-'.
$MemKey = -join ($BluvenRoot.ToCharArray() | ForEach-Object {
  if ($_ -match '[A-Za-z0-9]') { $_ } else { '-' }
})
$MemSrc = Join-Path $env:USERPROFILE ".claude\projects\$MemKey"

# --- Prepare destination -----------------------------------------------------
$dRepos = Join-Path $Dest 'repos'
$dMem   = Join-Path $Dest 'claude-memory'
$dDb    = Join-Path $Dest 'db-dump'
try {
  New-Item -ItemType Directory -Force -Path $dRepos, $dMem, $dDb -ErrorAction Stop | Out-Null
} catch {
  Die "Can't create destination under '$Dest' — is the drive plugged in? ($($_.Exception.Message))"
}
Info "Destination: $Dest"
Info "Memory key:  $MemKey"

# --- Copy repos (exclude deps & build artifacts) -----------------------------
$xd = @('node_modules', '.next', 'out', 'dist', '.vercel')
$xf = @('*.tsbuildinfo', '*.log')

function Copy-Repo($src, $name) {
  if (-not (Test-Path $src)) { Warn "skip $name (not found at $src)"; return }
  Info "copying repo: $name ..."
  robocopy $src (Join-Path $dRepos $name) /E /XD $xd /XF $xf /R:1 /W:1 /NFL /NDL /NJH /NJS | Out-Null
  if ($LASTEXITCODE -ge 8) { Die "robocopy failed for $name (exit $LASTEXITCODE)" }
}
Copy-Repo $BluvenRoot 'bluven'
Copy-Repo $CrmRoot    'CRM'

# --- Copy Claude memory + chat history ---------------------------------------
if (Test-Path $MemSrc) {
  Info "copying Claude memory + history ..."
  robocopy $MemSrc (Join-Path $dMem $MemKey) /E /R:1 /W:1 /NFL /NDL /NJH /NJS | Out-Null
  if ($LASTEXITCODE -ge 8) { Die "robocopy failed for memory (exit $LASTEXITCODE)" }
} else {
  Warn "memory folder not found at $MemSrc — skipped (different user/path?)."
}

# --- Dump databases ----------------------------------------------------------
if ($SkipDb) {
  Warn "DB dump skipped (-SkipDb)."
} elseif (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Warn "docker not found — DB dump skipped. Start Docker and re-run, or use -SkipDb."
} else {
  $running = (docker ps --filter "name=$PgContainer" --format '{{.Names}}')
  if ($running -ne $PgContainer) {
    Info "starting container $PgContainer ..."
    docker start $PgContainer 2>$null | Out-Null
  }
  foreach ($db in $Databases) {
    Info "dumping database: $db ..."
    # Dump to a file INSIDE the container, then `docker cp` it out. We must NOT
    # use PowerShell's `>` redirection here — it would re-encode the binary
    # custom-format dump (UTF-16 + CRLF) and corrupt it.
    docker exec $PgContainer pg_dump -U $PgUser -Fc -f "/tmp/$db.dump" $db
    if ($LASTEXITCODE -ne 0) { Warn "pg_dump failed for '$db' (does it exist?) — skipped."; continue }
    docker cp "${PgContainer}:/tmp/$db.dump" (Join-Path $dDb "$db.dump") | Out-Null
    docker exec $PgContainer rm -f "/tmp/$db.dump" | Out-Null
  }
}

Write-Host ""
Info "DONE. Safely eject the drive, then on the Mac run restore-on-mac.sh."
Write-Host "      Memory key (keep for reference): $MemKey" -ForegroundColor Green
