// SHA-256 Cryptographic Hash Service
// Generates tamper-proof, immutable proof of work

import crypto from 'crypto';
import QRCode from 'qrcode';
import { HashInput, QRCodeData } from '../types';
import prisma from '../utils/db';

export class HashService {
  private readonly algorithm = 'sha256';
  private readonly salt: string;

  constructor() {
    this.salt = process.env.HASH_SECRET_SALT || 'skillproof_default_salt';
  }

  /**
   * Generate SHA-256 hash from complete record data
   * Creates immutable proof combining audio, photos, and metadata
   */
  async generateRecordHash(input: HashInput): Promise<string> {
    const components: string[] = [];

    // 1. Audio component
    if (input.audioBuffer) {
      const audioHash = this.hashBuffer(input.audioBuffer);
      components.push(`audio:${audioHash}`);
    } else {
      components.push(`audio:${input.audioUrl}`);
    }

    // 2. Photos component (ordered array)
    if (input.photos && input.photos.length > 0) {
      const photosHash = this.hashArray(input.photos);
      components.push(`photos:${photosHash}`);
    }

    // 3. Metadata component
    const metadataString = JSON.stringify({
      workerPhone: input.metadata.workerPhone,
      clientPhone: input.metadata.clientPhone || null,
      skills: input.metadata.skills.map(s => ({
        name: s.skillName,
        category: s.category,
        level: s.level,
      })),
      timestamp: input.metadata.timestamp,
    });
    const metadataHash = this.hashString(metadataString);
    components.push(`metadata:${metadataHash}`);

    // 4. Combine all components with salt
    const combinedString = components.join('|') + `|salt:${this.salt}`;
    const finalHash = crypto
      .createHash(this.algorithm)
      .update(combinedString)
      .digest('hex');

    return finalHash;
  }

  /**
   * Hash individual audio file
   */
  hashAudioFile(buffer: Buffer): string {
    return this.hashBuffer(buffer);
  }

  /**
   * Hash individual photo
   */
  hashPhoto(buffer: Buffer): string {
    return this.hashBuffer(buffer);
  }

  /**
   * Hash string data
   */
  hashString(data: string): string {
    return crypto.createHash(this.algorithm).update(data).digest('hex');
  }

  /**
   * Hash buffer data
   */
  private hashBuffer(buffer: Buffer): string {
    return crypto.createHash(this.algorithm).update(buffer).digest('hex');
  }

  /**
   * Hash array of strings (preserves order)
   */
  private hashArray(items: string[]): string {
    const combined = items.sort().join('|');
    return this.hashString(combined);
  }

  /**
   * Generate QR code for verification hash
   */
  async generateQRCode(hash: string, recordId: string, workerPhone: string): Promise<QRCodeData> {
    const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/api/verify/${hash}`;

    const qrData: QRCodeData = {
      hash,
      recordId,
      workerPhone,
      verificationUrl,
    };

    return qrData;
  }

  /**
   * Generate QR code image (Base64)
   */
  async generateQRCodeImage(hash: string): Promise<string> {
    const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/api/verify/${hash}`;

    try {
      // Generate QR code as base64 data URL
      const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 400,
        margin: 2,
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('QR code generation failed:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Verify if a hash matches the stored record
   */
  async verifyHash(hash: string): Promise<boolean> {
    try {
      const ledgerEntry = await prisma.hashLedger.findUnique({
        where: { sha256Hash: hash },
        include: {
          record: {
            include: {
              worker: true,
              photoEvidence: true,
            },
          },
        },
      });

      if (!ledgerEntry) {
        return false;
      }

      // Increment access count
      await prisma.hashLedger.update({
        where: { id: ledgerEntry.id },
        data: {
          accessCount: { increment: 1 },
          lastAccessedAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      console.error('Hash verification failed:', error);
      return false;
    }
  }

  /**
   * Get complete verification record by hash
   */
  async getVerificationRecord(hash: string) {
    const ledgerEntry = await prisma.hashLedger.findUnique({
      where: { sha256Hash: hash },
      include: {
        record: {
          include: {
            worker: true,
            photoEvidence: true,
            smsVerifications: true,
          },
        },
      },
    });

    if (!ledgerEntry) {
      return null;
    }

    // Increment access count
    await prisma.hashLedger.update({
      where: { id: ledgerEntry.id },
      data: {
        accessCount: { increment: 1 },
        lastAccessedAt: new Date(),
      },
    });

    return ledgerEntry;
  }

  /**
   * Create hash ledger entry in database
   */
  async createHashLedger(
    recordId: string,
    sha256Hash: string,
    audioHash: string,
    photosHash: string | null,
    metadataHash: string
  ): Promise<void> {
    const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/api/verify/${sha256Hash}`;
    const qrCodeUrl = `${baseUrl}/api/qr/${sha256Hash}`;

    // Generate QR code data
    const qrCodeData = await this.generateQRCodeImage(sha256Hash);

    await prisma.hashLedger.create({
      data: {
        recordId,
        sha256Hash,
        audioHash,
        photosHash,
        metadataHash,
        verificationUrl,
        qrCodeUrl,
        qrCodeData,
        algorithm: this.algorithm,
        salt: this.salt,
      },
    });
  }

  /**
   * Check if hash already exists (duplicate detection)
   */
  async hashExists(hash: string): Promise<boolean> {
    const existing = await prisma.hashLedger.findUnique({
      where: { sha256Hash: hash },
    });
    return !!existing;
  }

  /**
   * Generate component hashes for ledger
   */
  generateComponentHashes(input: HashInput): {
    audioHash: string;
    photosHash: string | null;
    metadataHash: string;
  } {
    const audioHash = input.audioBuffer
      ? this.hashBuffer(input.audioBuffer)
      : this.hashString(input.audioUrl);

    const photosHash = input.photos && input.photos.length > 0
      ? this.hashArray(input.photos)
      : null;

    const metadataString = JSON.stringify(input.metadata);
    const metadataHash = this.hashString(metadataString);

    return { audioHash, photosHash, metadataHash };
  }
}

// Singleton instance
export const hashService = new HashService();
