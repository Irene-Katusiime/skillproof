// Trust Tier Calculation Service
// Computes trust metrics and credit readiness scores

import { TrustTier, VerificationMetrics, FinTechHandoff } from '../types';
import prisma from '../utils/db';

export class TrustService {
  /**
   * Calculate trust tier based on verification metrics
   * Bronze: 0-40 points
   * Silver: 41-75 points
   * Gold: 76-100 points
   */
  calculateTrustTier(trustScore: number): TrustTier {
    if (trustScore >= 76) return TrustTier.GOLD;
    if (trustScore >= 41) return TrustTier.SILVER;
    if (trustScore >= 20) return TrustTier.BRONZE;
    return TrustTier.NONE;
  }

  /**
   * Calculate comprehensive trust score (0-100)
   */
  calculateTrustScore(metrics: {
    verificationRatio: number;
    smsConfirmationRatio: number;
    photoValidityAvg: number;
    totalRecords: number;
  }): number {
    let score = 0;

    // Verification ratio (40 points)
    score += metrics.verificationRatio * 40;

    // SMS confirmation ratio (30 points)
    score += metrics.smsConfirmationRatio * 30;

    // Photo validity average (20 points)
    score += metrics.photoValidityAvg * 20;

    // Volume bonus (10 points) - logarithmic scale
    const volumeBonus = Math.min(10, Math.log10(metrics.totalRecords + 1) * 3);
    score += volumeBonus;

    return Math.min(100, Math.round(score * 10) / 10);
  }

  /**
   * Calculate credit readiness component scores
   * These feed into Person 4's Credit Readiness Index (0-800)
   */
  calculateCreditReadinessScores(metrics: {
    totalRecords: number;
    verificationRatio: number;
    smsConfirmationRatio: number;
    photoValidityAvg: number;
    repeatClientCount: number;
  }): {
    volumeScore: number;      // 30% weight
    verificationScore: number; // 35% weight
    validityScore: number;     // 20% weight
    repeatClientScore: number; // 15% weight
  } {
    // Volume Score (0-30): Based on number of records
    const volumeScore = Math.min(30, (metrics.totalRecords / 50) * 30);

    // Verification Score (0-35): SMS confirmation ratio
    const verificationScore = metrics.smsConfirmationRatio * 35;

    // Validity Score (0-20): Photo EXIF/pHash validity
    const validityScore = metrics.photoValidityAvg * 20;

    // Repeat Client Score (0-15): Customer loyalty
    const repeatClientScore = Math.min(15, (metrics.repeatClientCount / 10) * 15);

    return {
      volumeScore: Math.round(volumeScore * 10) / 10,
      verificationScore: Math.round(verificationScore * 10) / 10,
      validityScore: Math.round(validityScore * 10) / 10,
      repeatClientScore: Math.round(repeatClientScore * 10) / 10,
    };
  }

  /**
   * Update or create trust metrics for a worker
   */
  async updateTrustMetrics(workerId: string): Promise<void> {
    // Get all records for this worker
    const records = await prisma.skillRecord.findMany({
      where: { workerId },
      include: {
        photoEvidence: true,
        smsVerifications: true,
      },
    });

    const totalRecords = records.length;
    const verifiedRecords = records.filter(r => r.verificationStatus === 'verified').length;
    const pendingRecords = records.filter(r => r.verificationStatus === 'pending').length;
    const failedRecords = records.filter(r => r.verificationStatus === 'failed').length;

    // Calculate SMS confirmation ratio
    const totalSMS = records.reduce((sum, r) => sum + r.smsVerifications.length, 0);
    const confirmedSMS = records.reduce(
      (sum, r) => sum + r.smsVerifications.filter(s => s.status === 'confirmed').length,
      0
    );
    const smsConfirmationRatio = totalSMS > 0 ? confirmedSMS / totalSMS : 0;

    // Calculate photo validity average
    const allPhotos = records.flatMap(r => r.photoEvidence);
    const photoValidityAvg = allPhotos.length > 0
      ? allPhotos.reduce((sum, p) => sum + p.validityScore, 0) / allPhotos.length
      : 0;

    // Calculate verification ratio
    const verificationRatio = totalRecords > 0 ? verifiedRecords / totalRecords : 0;

    // Count unique clients (repeat customers)
    const uniqueClients = new Set(
      records.filter(r => r.clientPhone).map(r => r.clientPhone)
    );
    const repeatClientCount = uniqueClients.size;

    // Calculate trust score
    const trustScore = this.calculateTrustScore({
      verificationRatio,
      smsConfirmationRatio,
      photoValidityAvg,
      totalRecords,
    });

    // Calculate trust tier
    const trustTier = this.calculateTrustTier(trustScore);

    // Calculate credit readiness scores
    const creditScores = this.calculateCreditReadinessScores({
      totalRecords,
      verificationRatio,
      smsConfirmationRatio,
      photoValidityAvg,
      repeatClientCount,
    });

    // Count fraud indicators
    const fraudFlagCount = allPhotos.reduce((sum, p) => sum + p.fraudFlags.length, 0);
    const duplicatePhotoCount = allPhotos.filter(p => p.isDuplicate).length;

    // Update or create trust metrics
    await prisma.trustMetrics.upsert({
      where: { workerId },
      update: {
        totalRecords,
        verifiedRecords,
        pendingRecords,
        failedRecords,
        verificationRatio,
        smsConfirmationRatio,
        photoValidityAvg,
        trustTier,
        trustScore,
        volumeScore: creditScores.volumeScore,
        verificationScore: creditScores.verificationScore,
        validityScore: creditScores.validityScore,
        repeatClientScore: creditScores.repeatClientScore,
        fraudFlagCount,
        duplicatePhotoCount,
        lastCalculated: new Date(),
      },
      create: {
        workerId,
        totalRecords,
        verifiedRecords,
        pendingRecords,
        failedRecords,
        verificationRatio,
        smsConfirmationRatio,
        photoValidityAvg,
        trustTier,
        trustScore,
        volumeScore: creditScores.volumeScore,
        verificationScore: creditScores.verificationScore,
        validityScore: creditScores.validityScore,
        repeatClientScore: creditScores.repeatClientScore,
        fraudFlagCount,
        duplicatePhotoCount,
      },
    });
  }

  /**
   * Get verification metrics for a worker
   */
  async getVerificationMetrics(workerId: string): Promise<VerificationMetrics | null> {
    const metrics = await prisma.trustMetrics.findUnique({
      where: { workerId },
      include: {
        worker: true,
      },
    });

    if (!metrics) {
      return null;
    }

    return {
      workerId,
      totalRecords: metrics.totalRecords,
      verifiedRecords: metrics.verifiedRecords,
      verificationRatio: metrics.verificationRatio,
      smsConfirmations: Math.round(metrics.smsConfirmationRatio * metrics.totalRecords),
      photoValidityScore: metrics.photoValidityAvg,
      trustTier: metrics.trustTier as TrustTier,
      creditReadinessContribution: {
        volumeScore: metrics.volumeScore,
        verificationScore: metrics.verificationScore,
        validityScore: metrics.validityScore,
      },
    };
  }

  /**
   * Get complete handoff data for Person 4 (FinTech/Jobs)
   */
  async getFinTechHandoff(workerId: string): Promise<FinTechHandoff | null> {
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

    if (!worker || !worker.trustMetrics) {
      return null;
    }

    const metrics = worker.trustMetrics;
    const verificationMetrics = await this.getVerificationMetrics(workerId);

    if (!verificationMetrics) {
      return null;
    }

    return {
      workerId: worker.id,
      workerPhone: worker.phone,
      verificationMetrics,
      trustTier: metrics.trustTier as TrustTier,
      recentRecords: worker.skillRecords.map(record => ({
        recordId: record.id,
        skills: (record.skills as any[]).map(s => s.skillName),
        verified: record.verificationStatus === 'verified',
        timestamp: record.recordedAt,
      })),
    };
  }

  /**
   * Calculate trust tier from worker ID
   */
  async getTrustTierForWorker(workerId: string): Promise<TrustTier> {
    const metrics = await prisma.trustMetrics.findUnique({
      where: { workerId },
    });

    if (!metrics) {
      return TrustTier.NONE;
    }

    return metrics.trustTier as TrustTier;
  }
}

// Singleton instance
export const trustService = new TrustService();
