#!/bin/bash

# ============================================
# Self-Signed SSL Certificate Generator
# For development/testing ONLY
# ============================================

set -e

echo "🔐 Generating self-signed SSL certificate for development..."

# Create SSL directory if it doesn't exist
mkdir -p nginx/ssl

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=UMS/OU=IT/CN=localhost"

echo "✅ SSL certificate generated:"
echo "   - Certificate: nginx/ssl/cert.pem"
echo "   - Private key: nginx/ssl/key.pem"
echo ""
echo "⚠️  WARNING: This is a self-signed certificate for DEVELOPMENT only."
echo "   For PRODUCTION, use Let's Encrypt or a trusted CA."
echo ""
echo "To use Let's Encrypt in production, run:"
echo "   ./scripts/setup-letsencrypt.sh yourdomain.com"
