# ─────────────────────────────────────────────
# AUTO-PUSH SCRIPT
# Runs every 5 minutes via Windows Task Scheduler.
# Checks for uncommitted changes, commits with a
# descriptive message, and pushes to origin/main.
# ─────────────────────────────────────────────

$repoPath = "c:\Users\tukilolio\Desktop\promptwar"
$logFile  = "c:\Users\tukilolio\Desktop\promptwar\scripts\auto-push.log"
$branch   = "main"

# Timestamp helper
function Write-Log($msg) {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $logFile -Value "[$ts] $msg"
}

Set-Location $repoPath

# Check if there are any changes (staged, unstaged, or untracked)
$status = git status --porcelain 2>&1
if (-not $status) {
    # Nothing to commit — exit silently
    exit 0
}

Write-Log "Changes detected. Starting auto-push..."

# Stage all changes
git add -A 2>&1 | Out-Null

# Build a commit message from changed file names
$changedFiles = git diff --cached --name-only 2>&1
$fileList = ($changedFiles | Select-Object -First 5) -join ", "
$totalCount = ($changedFiles | Measure-Object).Count

if ($totalCount -gt 5) {
    $commitMsg = "chore(auto): update $fileList and $($totalCount - 5) more files"
} else {
    $commitMsg = "chore(auto): update $fileList"
}

# Commit
$commitResult = git commit -m $commitMsg 2>&1
Write-Log "Commit: $commitMsg"

# Push
$pushResult = git push origin $branch 2>&1
Write-Log "Push result: $pushResult"
Write-Log "Auto-push complete."
