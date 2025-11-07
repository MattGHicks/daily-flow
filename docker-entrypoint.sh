#!/bin/sh
set -e

echo "Starting Daily Flow..."

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy || true

echo "Migrations completed!"

# Execute the main command
exec "$@"
