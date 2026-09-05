// Verification Controller
// Handles verification record creation and hash resolution

import { Request, Response } from 'express';
import { hashService } from '../services/hashService';
import { trustService } from '../services/trustService';
import { SkillRecordInput, FrontendHandoff, VerificationStatus } from '../types';
import prisma from '../utils/db';

export class VerificationController {
  /**
   * Create new verification record
   * POST /api/verify/create
   */
  async createVerification(req: Request, res: Response): Promise<void> {
    try {
      const input: SkillRecordInput = req.body;

      // Validate input
      if (!input.workerPhone || !input.audioUrl || !input.extractedSkills) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: workerPhone, audioUrl, extractedSkills',
        });
        return;
      }

      // Find or create worker
      let worker = await prisma.worker.findUnique({
        where: { phone: input.workerPhone },
      });

      if (!worker) {
        worker = await prisma.worker.create({
          data: { phone: input.workerPhone },
        });
      }

      // Generate component hashes
      const { audioHash, photosHash, metadataHash } = hashService.generateComponentHashes({
        audioUrl: input.audioUrl,
        photos: input.photos,
        metadata: {
          workerPhone: input.workerPhone,
          clientPhone: input.clientPhone,
          skills: JSON.parse(JSON.stringify(input.extractedSkills)),
          timestamp: new Date().toISOString(),
        },
      });

      // Generate main SHA-256 hash
      const sha256Hash = await hashService.generateRecordHash({
        audioUrl: input.audioUrl,
        photos: input.photos,
        metadata: {
          workerPhone: input.workerPhone,
          clientPhone: input.clientPhone,
          skills: JSON.parse(JSON.stringify(input.extractedSkills)),
          timestamp: new Date().toISOString(),
        },
      });

      // Check for duplicate hash
      const hashExists = await hashService.hashExists(sha256Hash);
      if (hashExists) {
        res.status(409).json({
          success: false,
          error: 'Duplicate record detected - hash already exists',
          hash: sha256Hash,
        });
        return;
      }

      // Create skill record
      const record = await prisma.skillRecord.create({
        data: {
          workerId: worker.id,
          audioUrl: input.audioUrl,
          audioHash,
          skills: JSON.parse(JSON.stringify(input.extractedSkills)),
          clientPhone: input.clientPhone,
          sha256Hash,
          verificationStatus: VerificationStatus.PENDING,
        },
      });

      // Create hash ledger entry
      await hashService.createHashLedger(
        record.id,
        sha256Hash,
        audioHash,
        photosHash,
        metadataHash
      );

      // Create photo evidence if photos provided
      if (input.photos && input.photos.length > 0) {
        await Promise.all(
          input.photos.map(photoUrl =>
            prisma.photoEvidence.create({
              data: {
                recordId: record.id,
                photoUrl,
                hasEXIF: false, // Will be analyzed separately
                validityScore: 1.0,
              },
            })
          )
        );
      }

      // Update trust metrics
      await trustService.updateTrustMetrics(worker.id);

      // Generate QR code
      const qrCodeData = await hashService.generateQRCodeImage(sha256Hash);

      res.status(201).json({
        success: true,
        recordId: record.id,
        sha256Hash,
        verificationStatus: record.verificationStatus,
        qrCodeData,
        verificationUrl: `${process.env.PUBLIC_BASE_URL}/api/verify/${sha256Hash}`,
        message: 'Verification record created successfully',
      });
    } catch (error) {
      console.error('Create verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create verification record',
      });
    }
  }

  /**
   * Verify hash and get record details
   * GET /api/verify/:hash
   */
  async verifyHash(req: Request, res: Response): Promise<void> {
    try {
      const { hash } = req.params;

      if (!hash || hash.length !== 64) {
        res.status(400).json({
          success: false,
          error: 'Invalid hash format',
        });
        return;
      }

      const ledgerEntry = await hashService.getVerificationRecord(hash);

      if (!ledgerEntry) {
        res.status(404).json({
          success: false,
          error: 'Hash not found',
          verified: false,
        });
        return;
      }

      const record = ledgerEntry.record;
      const worker = record.worker;

      // Get trust metrics
      const trustTier = await trustService.getTrustTierForWorker(worker.id);

      // Build response
      const response: FrontendHandoff = {
        recordId: record.id,
        sha256Hash: hash,
        verificationStatus: record.verificationStatus as VerificationStatus,
        trustTier,
        qrcodeUrl: ledgerEntry.qrCodeUrl || '',
        qrcodeData: ledgerEntry.qrCodeData || '',
        verificationUrl: ledgerEntry.verificationUrl,
        worker: {
          id: worker.id,
          phone: worker.phone,
          name: worker.name || undefined,
        },
        skills: record.skills as any,
        evidence: {
          audioUrl: record.audioUrl,
          photos: record.photoEvidence.map(p => p.photoUrl),
        },
        verifications: {
          smsVerified: record.smsVerifications.some(s => s.status === 'confirmed'),
          clientConfirmed: !!record.clientPhone,
          photosValidated: record.photoEvidence.some(p => p.hasEXIF),
        },
        timestamp: record.recordedAt,
      };

      res.json({
        success: true,
        verified: true,
        data: response,
        accessCount: ledgerEntry.accessCount,
      });
    } catch (error) {
      console.error('Verify hash error:', error);
      res.status(500).json({
        success: false,
        error: 'Verification failed',
      });
    }
  }

  /**
   * Get verification details by record ID
   * GET /api/verify/record/:recordId
   */
  async getVerificationByRecordId(req: Request, res: Response): Promise<void> {
    try {
      const { recordId } = req.params;

      const record = await prisma.skillRecord.findUnique({
        where: { id: recordId },
        include: {
          worker: true,
          photoEvidence: true,
          smsVerifications: true,
          hashLedger: true,
        },
      });

      if (!record) {
        res.status(404).json({
          success: false,
          error: 'Record not found',
        });
        return;
      }

      const trustTier = await trustService.getTrustTierForWorker(record.workerId);

      const response: FrontendHandoff = {
        recordId: record.id,
        sha256Hash: record.sha256Hash,
        verificationStatus: record.verificationStatus as VerificationStatus,
        trustTier,
        qrcodeUrl: record.hashLedger?.qrCodeUrl || '',
        qrcodeData: record.hashLedger?.qrCodeData || '',
        verificationUrl: record.hashLedger?.verificationUrl || '',
        worker: {
          id: record.worker.id,
          phone: record.worker.phone,
          name: record.worker.name || undefined,
        },
        skills: record.skills as any,
        evidence: {
          audioUrl: record.audioUrl,
          photos: record.photoEvidence.map(p => p.photoUrl),
        },
        verifications: {
          smsVerified: record.smsVerifications.some(s => s.status === 'confirmed'),
          clientConfirmed: !!record.clientPhone,
          photosValidated: record.photoEvidence.some(p => p.hasEXIF),
        },
        timestamp: record.recordedAt,
      };

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error('Get verification by record ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch verification',
      });
    }
  }

  /**
   * Get QR code image
   * GET /api/qr/:hash
   */
  async getQRCode(req: Request, res: Response): Promise<void> {
    try {
      const { hash } = req.params;

      const ledgerEntry = await prisma.hashLedger.findUnique({
        where: { sha256Hash: hash },
      });

      if (!ledgerEntry || !ledgerEntry.qrCodeData) {
        res.status(404).json({
          success: false,
          error: 'QR code not found',
        });
        return;
      }

      // Extract base64 data from data URL
      const base64Data = ledgerEntry.qrCodeData.replace(/^data:image\/png;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      res.send(imageBuffer);
    } catch (error) {
      console.error('Get QR code error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch QR code',
      });
    }
  }
}

export const verificationController = new VerificationController();
