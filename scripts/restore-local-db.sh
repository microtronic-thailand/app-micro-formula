#!/bin/bash

# Configuration
DB_CONTAINER_NAME="micro-account-db"
DB_USER="postgres"
DB_NAME="postgres"

if [ -z "$1" ]; then
    echo "Usage: ./restore-local-db.sh <backup_file_path>"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: File '$BACKUP_FILE' not found."
    exit 1
fi

echo "⚠️  WARNING: This will OVERWRITE the current database data."
read -p "Are you sure you want to proceed? (y/n): " confirm
if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "Restoration cancelled."
    exit 1
fi

# Execute Restore
echo "Restoring database from '$BACKUP_FILE'..."
cat $BACKUP_FILE | docker exec -i $DB_CONTAINER_NAME psql -U $DB_USER -d $DB_NAME

if [ $? -eq 0 ]; then
    echo "✅ Restoration successful!"
else
    echo "❌ Restoration failed!"
    exit 1
fi
