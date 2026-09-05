#!/bin/bash

echo "🧹 Cleaning old installation..."
rm -rf node_modules package-lock.json

echo "📦 Installing fresh dependencies..."
npm install

echo "✅ Clean install complete!"
echo ""
echo "🎯 Next steps:"
echo "   npx prisma generate"
echo "   npx prisma migrate dev --name init"
echo "   npx ts-node prisma/seed.ts"
echo "   npm run dev"
