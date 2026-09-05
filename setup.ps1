# Skillproof Person 2 - Setup Script (PowerShell)

Write-Host "🚀 Skillproof Person 2 - Setup Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "🗄️  Step 2: Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma client generated" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Step 3: Running database migrations..." -ForegroundColor Yellow
npx prisma migrate dev --name init
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to run migrations" -ForegroundColor Red
    Write-Host "⚠️  Make sure PostgreSQL is running and DATABASE_URL is correct in .env" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Migrations complete" -ForegroundColor Green
Write-Host ""

Write-Host "🌱 Step 4: Seeding database..." -ForegroundColor Yellow
npx ts-node prisma/seed.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to seed database" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Database seeded" -ForegroundColor Green
Write-Host ""

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Update .env with your credentials"
Write-Host "   2. Run: npm run dev"
Write-Host "   3. Test: curl http://localhost:3000/health"
Write-Host ""
