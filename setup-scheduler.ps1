# setup-scheduler.ps1
# Registers a monthly Windows Task Scheduler job to run update-refs.js
# Run once as Administrator: powershell -ExecutionPolicy Bypass -File setup-scheduler.ps1

$taskName   = "AutoSilly-UpdateRefs"
$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Definition
$nodeExe    = "D:\VSProjects\node.exe"   # adjust if node is elsewhere
$scriptPath = Join-Path $scriptDir "update-refs.js"

# Find node automatically if the default path doesn't exist
if (-not (Test-Path $nodeExe)) {
    $nodeExe = (Get-Command node -ErrorAction SilentlyContinue)?.Source
    if (-not $nodeExe) { Write-Error "node.exe not found. Edit `$nodeExe in this script."; exit 1 }
}

$action  = New-ScheduledTaskAction -Execute $nodeExe -Argument $scriptPath -WorkingDirectory $scriptDir
$trigger = New-ScheduledTaskTrigger -Monthly -DaysOfMonth 1 -At "03:00"
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Hours 1) -RestartCount 2 -RestartInterval (New-TimeSpan -Minutes 10)

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -RunLevel Highest -Force

Write-Host ""
Write-Host "Scheduled task '$taskName' registered." -ForegroundColor Green
Write-Host "Runs on the 1st of every month at 03:00."
Write-Host "To run manually now: Start-ScheduledTask -TaskName '$taskName'"
Write-Host "To remove:           Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false"
