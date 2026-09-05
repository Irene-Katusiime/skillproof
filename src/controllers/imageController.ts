// Image Controller
// Handles photo upload, analysis, and forensic endpoints

import { Request, Response } from 'express';
import { imageService } from '../services/imageService';
import { trustService } from '../services/trustService';
import prisma from '../utils/db';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  },
});

export class ImageController {
  public upload = upload;

  /**
   * Analyze uploaded image
   * POST /api/image/analyze
   */
  async analyzeImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No image file provided',
        });
        return;
      }

      const { recordId } = req.body;

      if (!recordId) {
        res.status(400).json({
          success: false,
          error: 'recordId is required',
        });
        return;
      }

      // Analyze image
      const analysis = await imageService.analyzeImage(req.file.buffer, recordId);

      res.json({
        success: true,
        analysis: {
          hasEXIF: analysis.hasEXIF,
          metadata: analysis.metadata,
          pHash: analysis.pHash,
          isDuplicate: analysis.isDuplicate,
          duplicateOf: analysis.duplicateOf,
          validityScore: analysis.validityScore,
          fraudFlags: analysis.fraudFlags,
        },
        message: 'Image analyzed successfully',
      });
    } catch (error) {
      console.error('Analyze image error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze image',
      });
    }
  }

  /**
   * Compress image
   * POST /api/image/compress
   */
  async compressImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No image file provided',
        });
        return;
      }

      const quality = parseInt(req.body.quality || '80');

      // Compress image
      const compressed = await imageService.compressImage(req.file.buffer, quality);

      // Generate thumbnail
      const thumbnail = await imageService.generateThumbnail(req.file.buffer);

      res.json({
        success: true,
        originalSize: req.file.size,
        compressedSize: compressed.length,
        thumbnailSize: thumbnail.length,
        compressionRatio: ((1 - compressed.length / req.file.size) * 100).toFixed(2) + '%',
        message: 'Image compressed successfully',
      });
    } catch (error) {
      console.error('Compress image error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to compress image',
      });
    }
  }

  /**
   * Process photo evidence for a record
   * POST /api/image/process
   */
  async processPhotoEvidence(req: Request, res: Response): Promise<void> {
    try {
      const { photoUrl, recordId } = req.body;

      if (!photoUrl || !recordId) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: photoUrl, recordId',
        });
        return;
      }

      // Verify record exists
      const record = await prisma.skillRecord.findUnique({
        where: { id: recordId },
      });

      if (!record) {
        res.status(404).json({
          success: false,
          error: 'Skill record not found',
        });
        return;
      }

      // Process photo
      await imageService.processPhotoEvidence(photoUrl, recordId);

      // Update trust metrics
      await trustService.updateTrustMetrics(record.workerId);

      res.json({
        success: true,
        message: 'Photo evidence processed successfully',
      });
    } catch (error) {
      console.error('Process photo evidence error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process photo evidence',
      });
    }
  }

  /**
   * Batch process multiple photos
   * POST /api/image/batch-process
   */
  async batchProcessPhotos(req: Request, res: Response): Promise<void> {
    try {
      const { photoUrls, recordId } = req.body;

      if (!Array.isArray(photoUrls) || photoUrls.length === 0 || !recordId) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: photoUrls (array), recordId',
        });
        return;
      }

      // Verify record exists
      const record = await prisma.skillRecord.findUnique({
        where: { id: recordId },
      });

      if (!record) {
        res.status(404).json({
          success: false,
          error: 'Skill record not found',
        });
        return;
      }

      // Batch process
      const result = await imageService.batchProcessPhotos(photoUrls, recordId);

      // Update trust metrics
      await trustService.updateTrustMetrics(record.workerId);

      res.json({
        success: true,
        processed: result.processed,
        failed: result.failed,
        total: photoUrls.length,
        message: `Processed ${result.processed} of ${photoUrls.length} photos`,
      });
    } catch (error) {
      console.error('Batch process photos error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to batch process photos',
      });
    }
  }

  /**
   * Get photo evidence for a record
   * GET /api/image/record/:recordId
   */
  async getPhotoEvidence(req: Request, res: Response): Promise<void> {
    try {
      const { recordId } = req.params;

      const photos = await prisma.photoEvidence.findMany({
        where: { recordId },
        orderBy: { uploadedAt: 'desc' },
      });

      res.json({
        success: true,
        recordId,
        count: photos.length,
        photos: photos.map(p => ({
          id: p.id,
          photoUrl: p.photoUrl,
          thumbnailUrl: p.thumbnailUrl,
          compressedUrl: p.compressedUrl,
          hasEXIF: p.hasEXIF,
          cameraMake: p.cameraMake,
          cameraModel: p.cameraModel,
          capturedAt: p.capturedAt,
          location: p.latitude && p.longitude
            ? { latitude: p.latitude, longitude: p.longitude, altitude: p.altitude }
            : null,
          dimensions: p.width && p.height ? { width: p.width, height: p.height } : null,
          isDuplicate: p.isDuplicate,
          duplicateOf: p.duplicateOf,
          validityScore: p.validityScore,
          fraudFlags: p.fraudFlags,
          uploadedAt: p.uploadedAt,
          analyzedAt: p.analyzedAt,
        })),
      });
    } catch (error) {
      console.error('Get photo evidence error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get photo evidence',
      });
    }
  }

  /**
   * Check for duplicate photos
   * POST /api/image/check-duplicate
   */
  async checkDuplicate(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No image file provided',
        });
        return;
      }

      const { recordId } = req.body;

      // Generate pHash
      const analysis = await imageService.analyzeImage(req.file.buffer, recordId || 'temp');

      res.json({
        success: true,
        isDuplicate: analysis.isDuplicate,
        duplicateOf: analysis.duplicateOf,
        pHash: analysis.pHash,
        message: analysis.isDuplicate
          ? 'Duplicate photo detected'
          : 'No duplicate found',
      });
    } catch (error) {
      console.error('Check duplicate error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check duplicate',
      });
    }
  }

  /**
   * Get fraud detection statistics
   * GET /api/image/fraud-stats/:workerId
   */
  async getFraudStats(req: Request, res: Response): Promise<void> {
    try {
      const { workerId } = req.params;

      const records = await prisma.skillRecord.findMany({
        where: { workerId },
        include: {
          photoEvidence: true,
        },
      });

      const allPhotos = records.flatMap(r => r.photoEvidence);
      const totalPhotos = allPhotos.length;
      const photosWithEXIF = allPhotos.filter(p => p.hasEXIF).length;
      const duplicatePhotos = allPhotos.filter(p => p.isDuplicate).length;
      const photosWithGPS = allPhotos.filter(p => p.latitude && p.longitude).length;

      // Aggregate fraud flags
      const fraudFlagCounts: Record<string, number> = {};
      allPhotos.forEach(photo => {
        photo.fraudFlags.forEach(flag => {
          fraudFlagCounts[flag] = (fraudFlagCounts[flag] || 0) + 1;
        });
      });

      // Average validity score
      const avgValidityScore = totalPhotos > 0
        ? allPhotos.reduce((sum, p) => sum + p.validityScore, 0) / totalPhotos
        : 0;

      res.json({
        success: true,
        workerId,
        stats: {
          totalPhotos,
          photosWithEXIF,
          exifRatio: totalPhotos > 0 ? (photosWithEXIF / totalPhotos).toFixed(2) : '0.00',
          duplicatePhotos,
          duplicateRatio: totalPhotos > 0 ? (duplicatePhotos / totalPhotos).toFixed(2) : '0.00',
          photosWithGPS,
          gpsRatio: totalPhotos > 0 ? (photosWithGPS / totalPhotos).toFixed(2) : '0.00',
          avgValidityScore: avgValidityScore.toFixed(2),
          fraudFlagCounts,
          totalFraudFlags: Object.values(fraudFlagCounts).reduce((sum, count) => sum + count, 0),
        },
      });
    } catch (error) {
      console.error('Get fraud stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get fraud statistics',
      });
    }
  }
}

export const imageController = new ImageController();
