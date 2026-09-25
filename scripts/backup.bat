@echo off
setlocal

:: Ashram Meal Booking - Windows Database Auto Backup Script
echo Starting database backup...

:: Create backup directory if it doesn't exist
set BACKUP_DIR=db_backups
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

:: Generate Date-wise filename (Format: YYYY-MM-DD_HH-MM-SS)
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set FILENAME=%BACKUP_DIR%\backup_%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%-%datetime:~12,2%.sql

:: Run docker dump
docker exec -t maharaj_db pg_dump -U postgres ashram_meal_booking_db > "%FILENAME%"

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Backup saved to %FILENAME%
) else (
    echo [ERROR] Failed to take backup!
)

:: Note: Windows does not have a simple native command to delete files older than X days easily in Batch,
:: but if you want automatic cleanup, you can use PowerShell inside this script:
powershell -Command "Get-ChildItem -Path '%BACKUP_DIR%\*.sql' | Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-30) } | Remove-Item"
echo [SUCCESS] Cleaned up backups older than 30 days.

endlocal
pause
