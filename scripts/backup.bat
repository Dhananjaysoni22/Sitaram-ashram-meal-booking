@echo off
setlocal

:: Force the script to run in the correct project folder (not System32)
cd /d "%~dp0\.."

:: Ashram Meal Booking - Windows Database Auto Backup Script
echo Starting database backup in: %CD%

:: Create backup directory if it doesn't exist
set BACKUP_DIR=db_backups
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

:: Generate Date-wise filename reliably using PowerShell
for /f "usebackq tokens=*" %%i in (`powershell -NoProfile -Command "Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'"`) do set TIMESTAMP=%%i
set FILENAME=%BACKUP_DIR%\backup_%TIMESTAMP%.sql

echo Saving backup to: %FILENAME%

:: Run docker dump
docker exec -t maharaj_db pg_dump -U postgres ashram_meal_booking_db > "%FILENAME%"

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Backup saved to %FILENAME%
) else (
    echo [ERROR] Failed to take backup! Please check if Docker is running and the container name is correct.
)

:: Clean up backups older than 30 days
powershell -NoProfile -Command "Get-ChildItem -Path '%BACKUP_DIR%\*.sql' -ErrorAction SilentlyContinue | Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-30) } | Remove-Item -ErrorAction SilentlyContinue"
echo [SUCCESS] Cleaned up backups older than 30 days.

endlocal
pause
