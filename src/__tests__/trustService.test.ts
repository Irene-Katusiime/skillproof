// Trust Service Tests
import { trustService } from '../services/trustService';
import { TrustTier } from '../types';

describe('TrustService', () => {
  describe('calculateTrustTier', () => {
    it('should return GOLD for high scores', () => {
      expect(trustService.calculateTrustTier(90)).toBe(TrustTier.GOLD);
      expect(trustService.calculateTrustTier(76)).toBe(TrustTier.GOLD);
    });

    it('should return SILVER for medium scores', () => {
      expect(trustService.calculateTrustTier(60)).toBe(TrustTier.SILVER);
      expect(trustService.calculateTrustTier(41)).toBe(TrustTier.SILVER);
    });

    it('should return BRONZE for low scores', () => {
      expect(trustService.calculateTrustTier(30)).toBe(TrustTier.BRONZE);
      expect(trustService.calculateTrustTier(20)).toBe(TrustTier.BRONZE);
    });

    it('should return NONE for very low scores', () => {
      expect(trustService.calculateTrustTier(10)).toBe(TrustTier.NONE);
      expect(trustService.calculateTrustTier(0)).toBe(TrustTier.NONE);
    });
  });

  describe('calculateTrustScore', () => {
    it('should calculate perfect score', () => {
      const score = trustService.calculateTrustScore({
        verificationRatio: 1.0,
        smsConfirmationRatio: 1.0,
        photoValidityAvg: 1.0,
        totalRecords: 100,
      });

      expect(score).toBeGreaterThan(90);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should calculate low score for unverified records', () => {
      const score = trustService.calculateTrustScore({
        verificationRatio: 0.0,
        smsConfirmationRatio: 0.0,
        photoValidityAvg: 0.0,
        totalRecords: 1,
      });

      expect(score).toBeLessThan(20);
    });

    it('should give volume bonus', () => {
      const scoreWithFewRecords = trustService.calculateTrustScore({
        verificationRatio: 0.8,
        smsConfirmationRatio: 0.8,
        photoValidityAvg: 0.8,
        totalRecords: 5,
      });

      const scoreWithManyRecords = trustService.calculateTrustScore({
        verificationRatio: 0.8,
        smsConfirmationRatio: 0.8,
        photoValidityAvg: 0.8,
        totalRecords: 100,
      });

      expect(scoreWithManyRecords).toBeGreaterThan(scoreWithFewRecords);
    });
  });

  describe('calculateCreditReadinessScores', () => {
    it('should calculate all components', () => {
      const scores = trustService.calculateCreditReadinessScores({
        totalRecords: 50,
        verificationRatio: 0.9,
        smsConfirmationRatio: 0.85,
        photoValidityAvg: 0.95,
        repeatClientCount: 10,
      });

      expect(scores.volumeScore).toBeGreaterThan(0);
      expect(scores.verificationScore).toBeGreaterThan(0);
      expect(scores.validityScore).toBeGreaterThan(0);
      expect(scores.repeatClientScore).toBeGreaterThan(0);

      // Check weights
      expect(scores.volumeScore).toBeLessThanOrEqual(30);
      expect(scores.verificationScore).toBeLessThanOrEqual(35);
      expect(scores.validityScore).toBeLessThanOrEqual(20);
      expect(scores.repeatClientScore).toBeLessThanOrEqual(15);
    });

    it('should cap volume score at 30', () => {
      const scores = trustService.calculateCreditReadinessScores({
        totalRecords: 1000,
        verificationRatio: 1.0,
        smsConfirmationRatio: 1.0,
        photoValidityAvg: 1.0,
        repeatClientCount: 100,
      });

      expect(scores.volumeScore).toBe(30);
    });
  });
});
