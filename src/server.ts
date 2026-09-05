// Main Express Server
import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { checkDatabaseConnection, disconnectDatabase } from './utils/db';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/logger';

// Import routes
import verificationRoutes from './routes/verificationRoutes';
import imageRoutes from './routes/imageRoutes';
import qrRoutes from './routes/qrRoutes';
import workerRoutes from './routes/workerRoutes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Skillproof Verification API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/verify', verificationRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/workers', workerRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'Skillproof Verification & Cryptographic Vault API',
    version: '1.0.0',
    description: 'Person 2: Trust Infrastructure - SHA-256 Ledger, SMS Verification, Vision AI',
    endpoints: {
      health: '/health',
      verification: {
        create: 'POST /api/verify/create',
        verify: 'GET /api/verify/:hash',
        byRecord: 'GET /api/verify/record/:recordId',
      },
      image: {
        analyze: 'POST /api/image/analyze',
        compress: 'POST /api/image/compress',
        process: 'POST /api/image/process',
        batchProcess: 'POST /api/image/batch-process',
        getPhotos: 'GET /api/image/record/:recordId',
        checkDuplicate: 'POST /api/image/check-duplicate',
        fraudStats: 'GET /api/image/fraud-stats/:workerId',
      },
      qr: {
        get: 'GET /api/qr/:hash',
      },
      workers: {
        get: 'GET /api/workers/:workerId',
        byPhone: 'GET /api/workers/phone/:phone',
        records: 'GET /api/workers/:workerId/records',
        trust: 'GET /api/workers/:workerId/trust',
        fintechHandoff: 'GET /api/workers/:workerId/fintech-handoff',
        create: 'POST /api/workers',
      },
    },
    handoffs: {
      toFrontend: 'GET /api/verify/record/:recordId',
      toFinTech: 'GET /api/workers/:workerId/fintech-handoff',
    },
    documentation: {
      database: 'See DATABASE_SETUP.md',
      sms: 'See AFRICAS_TALKING_SETUP.md',
      readme: 'See README.md',
    },
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Check database connection
    console.log('🔍 Checking database connection...');
    const dbConnected = await checkDatabaseConnection();

    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check your DATABASE_URL in .env');
      process.exit(1);
    }

    // Start listening
    app.listen(PORT, () => {
      console.log('');
      console.log('╔════════════════════════════════════════════════════════════╗');
      console.log('║   🔐 SKILLPROOF VERIFICATION & CRYPTOGRAPHIC VAULT API    ║');
      console.log('║   Person 2: Trust Infrastructure Engineer                 ║');
      console.log('╚════════════════════════════════════════════════════════════╝');
      console.log('');
      console.log(`✅ Server running on: http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: Connected`);
      console.log('');
      console.log('🔗 Key Endpoints:');
      console.log(`   • Health: http://localhost:${PORT}/health`);
      console.log(`   • API Docs: http://localhost:${PORT}/`);
      console.log(`   • Create Verification: POST http://localhost:${PORT}/api/verify/create`);
      console.log(`   • Verify Hash: GET http://localhost:${PORT}/api/verify/:hash`);
      console.log('');
      console.log('📦 Handoff Endpoints:');
      console.log(`   • To P3 (Frontend): GET /api/verify/record/:recordId`);
      console.log(`   • To P4 (FinTech): GET /api/workers/:workerId/fintech-handoff`);
      console.log('');
      console.log('Press Ctrl+C to stop the server');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  await disconnectDatabase();
  process.exit(0);
});

// Start the server
startServer();

export default app;
