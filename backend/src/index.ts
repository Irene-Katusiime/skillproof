// src/index.ts
import express from 'express';
import creditRoutes from './routes/credit';
import jobRoutes from './routes/jobs';
import escrowRoutes from './routes/escrow';
import saccoRoutes from './routes/sacco';

const app = express();
app.use(express.json());

app.use('/api/credit', creditRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/sacco', saccoRoutes);

app.listen(5000, () => console.log('🚀 IMANI FinTech Engine running on http://localhost:5000'));