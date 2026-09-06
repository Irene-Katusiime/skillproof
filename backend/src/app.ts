import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ingestRoutes from './routes/ingest.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/ingest', ingestRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', component: 'Person 1 - Ingestion & AI Pipeline' });
});

app.listen(PORT, () => {
  console.log(`🚀 Person 1 Ingestion Service running on port ${PORT}`);
});

export default app;