#!/bin/bash

# Docker Build Script with Retry Logic
# This script helps build the Docker image when network is unstable

set -e

MAX_RETRIES=5
RETRY_COUNT=0
BUILD_SUCCESS=false

echo "🐳 Starting Docker build for PMS Frontend..."
echo "📍 Working directory: $(pwd)"
echo ""

# Function to build with retry
build_with_retry() {
    while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ "$BUILD_SUCCESS" = false ]; do
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "🔨 Build attempt $RETRY_COUNT of $MAX_RETRIES..."
        
        if docker compose up -d --build; then
            BUILD_SUCCESS=true
            echo "✅ Build successful!"
            echo ""
            echo "🎉 Container is now running on port 3030"
            echo "📊 Checking container status..."
            docker compose ps
            echo ""
            echo "📝 View logs with: docker compose logs -f pms-frontend"
            echo "🌐 Access at: http://localhost:3030"
        else
            if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
                WAIT_TIME=$((RETRY_COUNT * 10))
                echo "❌ Build failed. Waiting ${WAIT_TIME} seconds before retry..."
                sleep $WAIT_TIME
            else
                echo "❌ Build failed after $MAX_RETRIES attempts"
                echo ""
                echo "💡 Troubleshooting tips:"
                echo "  1. Check your internet connection"
                echo "  2. Try again later when network is more stable"
                echo "  3. Configure Docker to use different DNS:"
                echo "     Edit /etc/docker/daemon.json and add:"
                echo '     {"dns": ["8.8.8.8", "8.8.4.4"]}'
                echo "     Then: sudo systemctl restart docker"
                exit 1
            fi
        fi
    done
}

# Run the build
build_with_retry

exit 0
