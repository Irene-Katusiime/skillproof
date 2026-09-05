# Skillproof - Quick Command Reference

## 📦 Installation

```bash
# Install all dependencies
npm install

# Install TypeScript globally (optional)
npm install -g typescript ts-node
```

## 🗄️ Database Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations (create tables)
npm run prisma:migrate

# Seed database with test data
npx prisma db seed

# Open Prisma Studio (GUI)
npm run prisma:studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name migration_name
```

## 🚀 Server Commands

```bash
# Development mode (auto-reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## 🧪 Testing Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test hashService.test.ts
```

## 🔍 Debugging

```bash
# Check database connection
npx ts-node -e "import('./src/utils/db').then(m => m.checkDatabaseConnection())"

# Test PostgreSQL connection
psql -U postgres -d skillproof -c "SELECT 1"

# Check Node.js version
node --version

# Check npm version
npm --version
```

## 📊 PostgreSQL Commands

```bash
# Connect to database
psql -U postgres -d skillproof

# List all tables
\dt

# Describe table structure
\d table_name

# Show all databases
\l

# Quit psql
\q

# Backup database
pg_dump -U postgres skillproof > backup.sql

# Restore database
psql -U postgres skillproof < backup.sql
```

## 🧹 Cleanup Commands

```bash
# Remove node_modules
Remove-Item -Recurse -Force node_modules

# Remove build directory
Remove-Item -Recurse -Force dist

# Clean install
Remove-Item -Recurse -Force node_modules
npm install

# Clear Prisma cache
Remove-Item -Recurse -Force node_modules/.prisma
npm run prisma:generate
```

## 📝 Useful Scripts

```bash
# Check TypeScript errors
npx tsc --noEmit

# Format code (if prettier installed)
npx prettier --write .

# Lint code (if eslint installed)
npx eslint src/

# Check for outdated packages
npm outdated
```

## 🌐 API Testing (curl)

```bash
# Health check
curl http://localhost:3000/health

# Create verification
curl -X POST http://localhost:3000/api/verify/create \
  -H "Content-Type: application/json" \
  -d '{"workerPhone":"+256700000001","audioUrl":"https://example.com/audio.mp3","extractedSkills":[{"skillName":"Test","category":"Test","level":"beginner"}]}'

# Verify hash
curl http://localhost:3000/api/verify/YOUR_HASH_HERE

# Get worker trust
curl http://localhost:3000/api/workers/WORKER_ID/trust
```

## 🔧 Troubleshooting

```bash
# Rebuild Sharp (if image processing fails)
npm rebuild sharp

# Clear TypeScript cache
Remove-Item -Recurse -Force node_modules/.cache

# Reinstall Prisma
npm uninstall @prisma/client prisma
npm install @prisma/client prisma
npm run prisma:generate

# Check port availability
netstat -ano | findstr :3000
```

## 📱 Africa's Talking (ngrok for local development)

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Copy the https URL and add to Africa's Talking webhooks:
# https://YOUR_NGROK_URL.ngrok.io/api/webhook/sms
```

## 🐳 Docker (Optional)

```bash
# Start PostgreSQL in Docker
docker run --name skillproof-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres

# Stop container
docker stop skillproof-postgres

# Remove container
docker rm skillproof-postgres

# View logs
docker logs skillproof-postgres
```

## 📦 Package Management

```bash
# Add new dependency
npm install package-name

# Add dev dependency
npm install -D package-name

# Update all packages
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## 🎯 Quick Start Sequence

```bash
# 1. Install
npm install

# 2. Setup database
npm run prisma:generate
npm run prisma:migrate
npx prisma db seed

# 3. Run server
npm run dev

# 4. Test (in another terminal)
curl http://localhost:3000/health

# 5. View database
npm run prisma:studio
```

## 🚀 Deployment

```bash
# Build for production
npm run build

# Set production environment
$env:NODE_ENV="production"

# Run production server
npm start
```

## 📖 Documentation

```bash
# View all documentation files
Get-ChildItem *.md

# Read specific guide
Get-Content README.md
Get-Content QUICKSTART.md
Get-Content API_DOCUMENTATION.md
```

---

**Pro Tip:** Keep this file open in a second terminal for quick copy-paste!
