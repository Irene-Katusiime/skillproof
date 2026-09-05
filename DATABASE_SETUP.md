# Database Setup Guide

## Prerequisites

1. **PostgreSQL Installation**
   - Download from: https://www.postgresql.org/download/
   - Or use Docker:
     ```bash
     docker run --name skillproof-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
     ```

2. **Create Database**
   ```sql
   -- Connect to PostgreSQL
   psql -U postgres
   
   -- Create database
   CREATE DATABASE skillproof;
   
   -- Create user (optional)
   CREATE USER skillproof_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE skillproof TO skillproof_user;
   
   -- Exit
   \q
   ```

## Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/skillproof?schema=public"
   ```
   
   Or with custom user:
   ```env
   DATABASE_URL="postgresql://skillproof_user:your_secure_password@localhost:5432/skillproof?schema=public"
   ```

## Database Migrations

### First-Time Setup

```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate

# Seed database with test data
npx prisma db seed
```

### Subsequent Changes

```bash
# After updating schema.prisma, create new migration
npx prisma migrate dev --name your_migration_name

# Example: Add new field
npx prisma migrate dev --name add_worker_avatar
```

## Verify Setup

```bash
# Open Prisma Studio (GUI for database)
npm run prisma:studio

# Or check connection via script
npx ts-node -e "import('./src/utils/db').then(m => m.checkDatabaseConnection())"
```

## Database Schema Overview

### Core Tables

1. **Worker** - Skill passport owners
   - Unique phone number
   - Basic profile information

2. **SkillRecord** - Individual skill submissions
   - Audio evidence with hash
   - Extracted skills (JSON)
   - Client information
   - Verification status

3. **PhotoEvidence** - Visual proof with forensics
   - EXIF metadata (GPS, camera info)
   - Perceptual hash for duplicate detection
   - Validity score and fraud flags

4. **SMSVerification** - Client confirmations
   - SMS delivery tracking
   - Response logging
   - Confirmation status

5. **HashLedger** - Immutable cryptographic proof
   - SHA-256 hash
   - QR code data
   - Verification URL
   - Access tracking

6. **TrustMetrics** - Aggregate worker reputation
   - Verification ratios
   - Trust tier (bronze/silver/gold)
   - Credit readiness scores

7. **ClientConfirmation** - Customer feedback
   - Confirmation type
   - Rating and feedback
   - Related records

## Troubleshooting

### Connection Issues

```bash
# Test PostgreSQL connection
psql -U postgres -d skillproof -c "SELECT 1"

# Check if PostgreSQL is running
# Windows:
Get-Service postgresql*

# Linux/Mac:
sudo systemctl status postgresql
```

### Reset Database

```bash
# ⚠️ WARNING: This deletes all data!
npx prisma migrate reset

# Rebuild from scratch
npm run prisma:generate
npm run prisma:migrate
npx prisma db seed
```

### Migration Issues

```bash
# If migrations are out of sync
npx prisma migrate resolve --applied "migration_name"

# Force push schema (dev only)
npx prisma db push --force-reset
```

## Production Deployment

1. **Never run migrations directly in production**
2. Use CI/CD pipeline
3. Example deploy script:
   ```bash
   npm run prisma:generate
   npx prisma migrate deploy
   ```

4. **Connection Pooling** (Recommended for production):
   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=10"
   ```

## Backup & Restore

### Backup
```bash
pg_dump -U postgres skillproof > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore
```bash
psql -U postgres skillproof < backup_20260905_123456.sql
```
