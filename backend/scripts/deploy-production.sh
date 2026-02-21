#!/bin/bash

# ============================================
# Production Deployment Script
# ============================================

set -e

echo "🚀 UMS Production Deployment"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "   Copy .env.example to .env and configure your secrets"
    exit 1
fi

# Check for required environment variables
required_vars=("JWT_SECRET" "JWT_REFRESH_SECRET" "WEBHOOK_SECRET" "DB_PASSWORD" "REDIS_PASSWORD")
missing_vars=()

for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env || grep -q "^${var}=changeme" .env || grep -q "^${var}=your-" .env; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "❌ Error: The following environment variables need to be configured:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please update your .env file with production secrets"
    exit 1
fi

echo "✅ Environment validation passed"
echo ""

# Pull latest images
echo "📦 Pulling latest images..."
docker-compose pull

# Build application
echo "🔨 Building application..."
docker-compose build --no-cache api

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for database
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
echo "📊 Running database migrations..."
docker-compose exec -T api npx prisma migrate deploy

# Check health
echo "🏥 Checking service health..."
sleep 5

if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "Services running:"
    docker-compose ps
    echo ""
    echo "Logs: docker-compose logs -f"
    echo "Stop: docker-compose down"
else
    echo "❌ Deployment failed. Check logs:"
    docker-compose logs
    exit 1
fi
