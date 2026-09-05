// Hash Service Tests
import { hashService } from '../services/hashService';
import { HashInput } from '../types';

describe('HashService', () => {
  describe('generateRecordHash', () => {
    it('should generate consistent hash for same input', async () => {
      const input: HashInput = {
        audioUrl: 'https://example.com/audio1.mp3',
        photos: ['https://example.com/photo1.jpg'],
        metadata: {
          workerPhone: '+256700000001',
          clientPhone: '+256700000100',
          skills: [
            {
              skillName: 'Carpentry',
              category: 'Construction',
              level: 'advanced',
              yearsExperience: 5,
            },
          ],
          timestamp: '2026-09-05T12:00:00Z',
        },
      };

      const hash1 = await hashService.generateRecordHash(input);
      const hash2 = await hashService.generateRecordHash(input);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex characters
    });

    it('should generate different hashes for different inputs', async () => {
      const input1: HashInput = {
        audioUrl: 'https://example.com/audio1.mp3',
        metadata: {
          workerPhone: '+256700000001',
          skills: [{ skillName: 'Carpentry', category: 'Construction', level: 'advanced' }],
          timestamp: '2026-09-05T12:00:00Z',
        },
      };

      const input2: HashInput = {
        audioUrl: 'https://example.com/audio2.mp3',
        metadata: {
          workerPhone: '+256700000001',
          skills: [{ skillName: 'Plumbing', category: 'Construction', level: 'intermediate' }],
          timestamp: '2026-09-05T12:00:00Z',
        },
      };

      const hash1 = await hashService.generateRecordHash(input1);
      const hash2 = await hashService.generateRecordHash(input2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('hashString', () => {
    it('should hash strings correctly', () => {
      const text = 'test string';
      const hash = hashService.hashString(text);

      expect(hash).toBeTruthy();
      expect(hash).toHaveLength(64);
    });

    it('should produce consistent hashes', () => {
      const text = 'consistent test';
      const hash1 = hashService.hashString(text);
      const hash2 = hashService.hashString(text);

      expect(hash1).toBe(hash2);
    });
  });

  describe('generateComponentHashes', () => {
    it('should generate all component hashes', () => {
      const input: HashInput = {
        audioUrl: 'https://example.com/audio1.mp3',
        photos: ['photo1.jpg', 'photo2.jpg'],
        metadata: {
          workerPhone: '+256700000001',
          skills: [{ skillName: 'Test', category: 'Test', level: 'beginner' }],
          timestamp: '2026-09-05T12:00:00Z',
        },
      };

      const hashes = hashService.generateComponentHashes(input);

      expect(hashes.audioHash).toBeTruthy();
      expect(hashes.photosHash).toBeTruthy();
      expect(hashes.metadataHash).toBeTruthy();
    });

    it('should handle missing photos', () => {
      const input: HashInput = {
        audioUrl: 'https://example.com/audio1.mp3',
        metadata: {
          workerPhone: '+256700000001',
          skills: [],
          timestamp: '2026-09-05T12:00:00Z',
        },
      };

      const hashes = hashService.generateComponentHashes(input);

      expect(hashes.audioHash).toBeTruthy();
      expect(hashes.photosHash).toBeNull();
      expect(hashes.metadataHash).toBeTruthy();
    });
  });
});
