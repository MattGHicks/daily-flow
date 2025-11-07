#!/bin/bash
# Daily Flow Deployment Script
# Deploys local changes to T630 production server

set -e

echo "🚀 Daily Flow Deployment Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVER="t630"
REMOTE_PATH="~/homelab/projects/daily-flow-v2"
LOCAL_PATH="/Users/matt/Documents/My Coding Projects/daily-flow-v2"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must run from daily-flow-v2 directory${NC}"
    exit 1
fi

# Optional: Run tests locally first
echo "📋 Step 1: Pre-deployment checks"
echo "- Checking Docker connection..."
if ! docker ps &> /dev/null; then
    echo -e "${YELLOW}Warning: Docker not running locally (optional)${NC}"
fi

# Sync files to server
echo ""
echo "📦 Step 2: Syncing files to server..."
rsync -avz \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '*.log' \
  --exclude '.env' \
  --progress \
  . $SERVER:$REMOTE_PATH/

echo -e "${GREEN}✓ Files synced${NC}"

# Rebuild and restart on server
echo ""
echo "🔨 Step 3: Building and deploying on server..."
ssh $SERVER "cd $REMOTE_PATH && docker compose up -d --build"

echo ""
echo -e "${GREEN}✓ Deployment complete!${NC}"

# Show status
echo ""
echo "📊 Step 4: Checking deployment status..."
ssh $SERVER "docker ps | grep daily-flow"

echo ""
echo "🎉 Daily Flow deployed successfully!"
echo ""
echo "Access at:"
echo "  • Local: http://192.168.254.126:3100"
echo "  • Public: https://dailyflow.mght630.com (requires VPN)"
echo ""
echo "View logs: ssh t630 'docker logs daily-flow-app -f'"
echo ""
