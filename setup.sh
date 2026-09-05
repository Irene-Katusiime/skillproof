#!/bin/bash

echo "🚀 Skillproof Person 2 - Setup Script"
echo "======================================"
echo ""

echo "📦 Step 1: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

echo "🗄️  Step 2: Generating Prisma client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi
echo "✅ Prisma client generated"
echo ""

echo "🔧 Step 3: Running database migrations..."
npx prisma migrate dev --name init
if [ $? -ne 0 ]; then
    echo "❌ Failed to run migrations"
    exit 1
fi
echo "✅ Migrations complete"
echo ""

echo "🌱 Step 4: Seeding database..."
npx ts-node prisma/seed.ts
if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi
echo "✅ Database seeded"
echo ""

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Update .env with your credentials"
echo "   2. Run: npm run dev"
echo "   3. Test: curl http://localhost:3000/health"
echo ""
