#!/bin/sh
set -e

echo "Running migrations..."
npx prisma migrate deploy

if [ "$RUN_SEED" = "true" ]; then
  echo "Running seed..."
  npx tsx prisma/seed.ts
else
  echo "Skipping seed..."
fi

echo "Starting backend..."
npm run start:server
