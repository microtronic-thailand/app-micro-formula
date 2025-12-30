#!/bin/bash

# Configuration
DB_CONTAINER_NAME="micro-account-db" # Adjust if your container name is different
DB_USER="postgres"
DB_NAME="postgres"
BACKUP_DIR="./backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Check if container is running
if [ ! "$(docker ps -q -f name=$DB_CONTAINER_NAME)" ]; then
    echo "Error: Database container '$DB_CONTAINER_NAME' is not running."
    exit 1
fi

# Execute Backup
echo "Starting backup of database '$DB_NAME' from container '$DB_CONTAINER_NAME'..."
docker exec -t $DB_CONTAINER_NAME pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup successful! File saved to: $BACKUP_FILE"
    # Optional: Keep only last 7 days of backups
    find $BACKUP_DIR -type f -name "*.sql" -mtime +7 -delete
else
    echo "❌ Backup failed!"
    exit 1
fi
