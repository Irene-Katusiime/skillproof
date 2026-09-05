// Worker & Records Routes
import { Router } from 'express';
import { trustService } from '../services/trustService';
import prisma from '../utils/db';

const router = Router();

// Get worker profile
router.get('/:workerId', async (req, res) => {
  try {
    const { workerId } = req.params;

    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        trustMetrics: true,
        skillRecords: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
          include: {
            photoEvidence: true,
            smsVerifications: true,
          },
        },
      },
    });

    if (!worker) {
      res.status(404).json({
        success: false,
        error: 'Worker not found',
      });
      return;
    }

    res.json({
      success: true,
      worker: {
        id: worker.id,
        phone: worker.phone,
        name: worker.name,
        email: worker.email,
        createdAt: worker.createdAt,
        trustMetrics: worker.trustMetrics,
        recentRecords: worker.skillRecords.map(r => ({
          id: r.id,
          skills: r.skills,
          verificationStatus: r.verificationStatus,
          recordedAt: r.recordedAt,
          photoCount: r.photoEvidence.length,
          smsVerified: r.smsVerifications.some(s => s.status === 'confirmed'),
        })),
      },
    });
  } catch (error) {
    console.error('Get worker error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get worker',
    });
  }
});

// Get worker by phone
router.get('/phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;

    const worker = await prisma.worker.findUnique({
      where: { phone },
      include: {
        trustMetrics: true,
      },
    });

    if (!worker) {
      res.status(404).json({
        success: false,
        error: 'Worker not found',
      });
      return;
    }

    res.json({
      success: true,
      worker: {
        id: worker.id,
        phone: worker.phone,
        name: worker.name,
        email: worker.email,
        trustMetrics: worker.trustMetrics,
      },
    });
  } catch (error) {
    console.error('Get worker by phone error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get worker',
    });
  }
});

// Get all records for a worker
router.get('/:workerId/records', async (req, res) => {
  try {
    const { workerId } = req.params;
    const { limit = '20', offset = '0' } = req.query;

    const records = await prisma.skillRecord.findMany({
      where: { workerId },
      orderBy: { recordedAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      include: {
        photoEvidence: true,
        smsVerifications: true,
        hashLedger: true,
      },
    });

    const total = await prisma.skillRecord.count({
      where: { workerId },
    });

    res.json({
      success: true,
      workerId,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      records: records.map(r => ({
        id: r.id,
        skills: r.skills,
        audioUrl: r.audioUrl,
        clientPhone: r.clientPhone,
        verificationStatus: r.verificationStatus,
        sha256Hash: r.sha256Hash,
        recordedAt: r.recordedAt,
        verifiedAt: r.verifiedAt,
        photoCount: r.photoEvidence.length,
        smsVerified: r.smsVerifications.some(s => s.status === 'confirmed'),
        qrCodeUrl: r.hashLedger?.qrCodeUrl,
      })),
    });
  } catch (error) {
    console.error('Get worker records error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get records',
    });
  }
});

// Get trust metrics for a worker
router.get('/:workerId/trust', async (req, res) => {
  try {
    const { workerId } = req.params;

    const metrics = await trustService.getVerificationMetrics(workerId);

    if (!metrics) {
      res.status(404).json({
        success: false,
        error: 'Trust metrics not found',
      });
      return;
    }

    res.json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error('Get trust metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get trust metrics',
    });
  }
});

// Get FinTech handoff data (for Person 4)
router.get('/:workerId/fintech-handoff', async (req, res) => {
  try {
    const { workerId } = req.params;

    const handoff = await trustService.getFinTechHandoff(workerId);

    if (!handoff) {
      res.status(404).json({
        success: false,
        error: 'Worker not found or no data available',
      });
      return;
    }

    res.json({
      success: true,
      handoff,
    });
  } catch (error) {
    console.error('Get FinTech handoff error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get FinTech handoff data',
    });
  }
});

// Create or update worker
router.post('/', async (req, res) => {
  try {
    const { phone, name, email } = req.body;

    if (!phone) {
      res.status(400).json({
        success: false,
        error: 'Phone number is required',
      });
      return;
    }

    const worker = await prisma.worker.upsert({
      where: { phone },
      update: { name, email },
      create: { phone, name, email },
    });

    res.json({
      success: true,
      worker,
    });
  } catch (error) {
    console.error('Create/update worker error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create/update worker',
    });
  }
});

export default router;
