#!/bin/bash
# Ashram Meal Booking - Database Auto Backup Script
# This script creates date-wise backups and deletes backups older than 30 days

# Set the directory where backups will be stored (relative to script execution location)
BACKUP_DIR="./db_backups"
mkdir -p "$BACKUP_DIR"

# Generate a timestamp for the filename (e.g., backup_2026-09-25_14-30-00.sql)
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
FILENAME="$BACKUP_DIR/backup_${TIMESTAMP}.sql"

# Run the docker command to extract the database
echo "Starting database backup..."
docker exec -t maharaj_db pg_dump -U postgres ashram_meal_booking_db > "$FILENAME"

# Check if the backup was successful
if [ $? -eq 0 ]; then
  echo "✅ Backup successfully saved to: $FILENAME"
else
  echo "❌ Error during backup!"
  exit 1
fi

# Cleanup: Automatically delete backups older than 30 days to save disk space
echo "Cleaning up backups older than 30 days..."
find "$BACKUP_DIR" -type f -name "*.sql" -mtime +30 -exec rm {} \;

echo "Backup process complete!"
