#!/bin/bash

# ============================================
# Database Backup Script
# ============================================

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="ums_backup_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

echo "📦 Backing up database to: $BACKUP_DIR/$BACKUP_FILE"

# Get database credentials from .env
DB_USER=$(grep DB_USER .env | cut -d '=' -f2 | tr -d '"' || echo "ums_admin")
DB_NAME=$(grep DB_NAME .env | cut -d '=' -f2 | tr -d '"' || echo "ums_db")

# Create backup
docker-compose exec -T postgres pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

echo "✅ Backup completed: $BACKUP_DIR/$BACKUP_FILE.gz"
echo ""
echo "To restore:"
echo "  gunzip $BACKUP_DIR/$BACKUP_FILE.gz"
echo "  docker-compose exec -T postgres psql -U $DB_USER -d $DB_NAME < $BACKUP_DIR/$BACKUP_FILE"
