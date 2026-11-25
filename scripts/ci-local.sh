#!/usr/bin/env bash
# Re-run lint, typecheck, the payments flag tests, a production build, and
# Playwright against a local database. Refuses hosted database URLs.
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required and must point at a local Postgres database."
  exit 1
fi

case "$DATABASE_URL" in
  *supabase.com*|*pooler.supabase*|*neon.tech*|*vercel-storage*|*amazonaws.com*)
    echo "Refusing to run against a hosted database: $DATABASE_URL"
    exit 1
    ;;
esac

export PAYMENTS_ENABLED=false
export AUTH_SECRET="${AUTH_SECRET:-local-e2e-auth-secret-not-for-production}"
export AUTH_URL="${AUTH_URL:-http://127.0.0.1:3000}"
export NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-http://127.0.0.1:3000}"
export ADMIN_SEED_EMAIL="${ADMIN_SEED_EMAIL:-admin@todassembly.com}"
export ADMIN_SEED_PASSWORD="${ADMIN_SEED_PASSWORD:-ChangeMe123!}"
export CRON_SECRET="${CRON_SECRET:-local-cron-secret}"
export CI=true

echo "Pushing schema and seeding the local database..."
npx prisma db push
npx prisma db seed

echo "Payments flag unit tests..."
npm run test:payments

echo "Lint and typecheck..."
npm run lint
npm run typecheck

echo "Production build..."
npm run build

echo "Installing Playwright Chromium if needed..."
npx playwright install chromium

echo "End-to-end tests..."
npm run test:e2e
