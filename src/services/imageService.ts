// Vision & Forensic AI Pipeline
// EXIF extraction, GPS tagging, pHash duplicate detection, image compression

import sharp from 'sharp';
import * as exifReader from 'exif-reader';
import { ImageAnalysisResult } from '../types';
import prisma from '../utils/db';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

export class ImageService {
  private readonly uploadDir: string;
  private readonly pHashThreshold: number = 10; // Hamming distance threshold for duplicates

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
  }

  /**
   * Analyze image: Extract EXIF, detect duplicates, calculate validity score
   */
  async analyzeImage(imageBuffer: Buffer, recordId: string): Promise<ImageAnalysisResult> {
    const result: ImageAnalysisResult = {
      hasEXIF: false,
      pHash: '',
      isDuplicate: false,
      validityScore: 0.5, // Start with neutral score
      fraudFlags: [],
    };

    try {
      // 1. Extract EXIF metadata
      const exifData = await this.extractEXIF(imageBuffer);
      if (exifData) {
        result.hasEXIF = true;
        result.metadata = exifData;
        result.validityScore += 0.2; // EXIF presence increases validity
      } else {
        result.fraudFlags.push('no_exif_data');
      }

      // 2. Generate perceptual hash
      result.pHash = await this.generatePHash(imageBuffer);

      // 3. Check for duplicates
      const duplicateCheck = await this.checkDuplicate(result.pHash, recordId);
      result.isDuplicate = duplicateCheck.isDuplicate;
      result.duplicateOf = duplicateCheck.duplicateOf;

      if (result.isDuplicate) {
        result.fraudFlags.push('duplicate_photo');
        result.validityScore -= 0.3;
      }

      // 4. Validate GPS data
      if (result.metadata?.gps) {
        const gpsValid = this.validateGPS(result.metadata.gps);
        if (!gpsValid) {
          result.fraudFlags.push('invalid_gps');
          result.validityScore -= 0.1;
        } else {
          result.validityScore += 0.1; // Valid GPS increases trust
        }
      }

      // 5. Check image dimensions (too small = suspicious)
      if (result.metadata?.dimensions) {
        const { width, height } = result.metadata.dimensions;
        if (width < 400 || height < 400) {
          result.fraudFlags.push('low_resolution');
          result.validityScore -= 0.1;
        }
      }

      // 6. Verify capture date (future date = fraudulent)
      if (result.metadata?.dateTime) {
        const captureDate = new Date(result.metadata.dateTime);
        if (captureDate > new Date()) {
          result.fraudFlags.push('future_date');
          result.validityScore -= 0.2;
        }
      }

      // Ensure validity score stays between 0 and 1
      result.validityScore = Math.max(0, Math.min(1, result.validityScore));

    } catch (error) {
      console.error('Image analysis error:', error);
      result.fraudFlags.push('analysis_failed');
      result.validityScore = 0.3;
    }

    return result;
  }

  /**
   * Extract EXIF metadata from image
   */
  private async extractEXIF(imageBuffer: Buffer): Promise<{
    make?: string;
    model?: string;
    dateTime?: string;
    gps?: {
      latitude: number;
      longitude: number;
      altitude?: number;
    };
    dimensions: {
      width: number;
      height: number;
    };
  } | null> {
    try {
      const metadata = await sharp(imageBuffer).metadata();

      // Extract basic dimensions
      const dimensions = {
        width: metadata.width || 0,
        height: metadata.height || 0,
      };

      // Try to parse EXIF data
      if (!metadata.exif) {
        return { dimensions };
      }

      const exifData = exifReader(metadata.exif);
      
      // Extract camera info
      const make = exifData.Image?.Make?.toString();
      const model = exifData.Image?.Model?.toString();
      
      // Extract date
      let dateTime: string | undefined;
      if (exifData.Photo?.DateTimeOriginal) {
        dateTime = exifData.Photo.DateTimeOriginal.toString();
      } else if (exifData.Image?.DateTime) {
        dateTime = exifData.Image.DateTime.toString();
      }

      // Extract GPS
      let gps: { latitude: number; longitude: number; altitude?: number } | undefined;
      if (exifData.GPS) {
        const latitude = this.parseGPSCoordinate(
          exifData.GPS.GPSLatitude as any,
          exifData.GPS.GPSLatitudeRef as string
        );
        const longitude = this.parseGPSCoordinate(
          exifData.GPS.GPSLongitude as any,
          exifData.GPS.GPSLongitudeRef as string
        );

        if (latitude !== null && longitude !== null) {
          gps = { latitude, longitude };

          // Altitude (optional)
          if (exifData.GPS.GPSAltitude) {
            gps.altitude = Number(exifData.GPS.GPSAltitude);
          }
        }
      }

      return {
        make,
        model,
        dateTime,
        gps,
        dimensions,
      };
    } catch (error) {
      console.error('EXIF extraction error:', error);
      return null;
    }
  }

  /**
   * Parse GPS coordinates from EXIF format
   */
  private parseGPSCoordinate(coords: number[], ref: string): number | null {
    if (!coords || coords.length !== 3) {
      return null;
    }

    const [degrees, minutes, seconds] = coords;
    let decimal = degrees + minutes / 60 + seconds / 3600;

    // Apply direction (S and W are negative)
    if (ref === 'S' || ref === 'W') {
      decimal = -decimal;
    }

    return decimal;
  }

  /**
   * Generate perceptual hash (pHash) for duplicate detection
   * Using simple approach with Sharp for MVP
   */
  private async generatePHash(imageBuffer: Buffer): Promise<string> {
    try {
      // Resize to 8x8 and convert to grayscale
      const resized = await sharp(imageBuffer)
        .resize(8, 8, { fit: 'fill' })
        .grayscale()
        .raw()
        .toBuffer();

      // Calculate average pixel value
      let total = 0;
      for (let i = 0; i < resized.length; i++) {
        total += resized[i];
      }
      const avg = total / resized.length;

      // Generate hash: 1 if pixel > avg, 0 otherwise
      let hash = '';
      for (let i = 0; i < resized.length; i++) {
        hash += resized[i] > avg ? '1' : '0';
      }

      // Convert binary to hex
      let hexHash = '';
      for (let i = 0; i < hash.length; i += 4) {
        const chunk = hash.slice(i, i + 4);
        hexHash += parseInt(chunk, 2).toString(16);
      }

      return hexHash;
    } catch (error) {
      console.error('pHash generation error:', error);
      return '';
    }
  }

  /**
   * Check if image is duplicate based on pHash
   */
  private async checkDuplicate(
    pHash: string,
    currentRecordId: string
  ): Promise<{ isDuplicate: boolean; duplicateOf?: string }> {
    if (!pHash) {
      return { isDuplicate: false };
    }

    try {
      // Get all existing photos with pHash
      const existingPhotos = await prisma.photoEvidence.findMany({
        where: {
          pHash: { not: null },
          recordId: { not: currentRecordId }, // Exclude same record
        },
        select: {
          id: true,
          pHash: true,
          recordId: true,
        },
      });

      // Calculate Hamming distance for each
      for (const photo of existingPhotos) {
        if (!photo.pHash) continue;

        const distance = this.hammingDistance(pHash, photo.pHash);
        
        // If distance is below threshold, it's a duplicate
        if (distance <= this.pHashThreshold) {
          return {
            isDuplicate: true,
            duplicateOf: photo.recordId,
          };
        }
      }

      return { isDuplicate: false };
    } catch (error) {
      console.error('Duplicate check error:', error);
      return { isDuplicate: false };
    }
  }

  /**
   * Calculate Hamming distance between two hashes
   */
  private hammingDistance(hash1: string, hash2: string): number {
    if (hash1.length !== hash2.length) {
      return Infinity;
    }

    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] !== hash2[i]) {
        distance++;
      }
    }

    return distance;
  }

  /**
   * Validate GPS coordinates
   */
  private validateGPS(gps: { latitude: number; longitude: number }): boolean {
    const { latitude, longitude } = gps;

    // Check valid ranges
    if (latitude < -90 || latitude > 90) {
      return false;
    }
    if (longitude < -180 || longitude > 180) {
      return false;
    }

    // Check for null island (0, 0) - suspicious
    if (latitude === 0 && longitude === 0) {
      return false;
    }

    return true;
  }

  /**
   * Compress and optimize image
   */
  async compressImage(imageBuffer: Buffer, quality: number = 80): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .resize(1920, 1080, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality, progressive: true })
        .toBuffer();
    } catch (error) {
      console.error('Image compression error:', error);
      return imageBuffer;
    }
  }

  /**
   * Generate thumbnail
   */
  async generateThumbnail(imageBuffer: Buffer, size: number = 300): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      return imageBuffer;
    }
  }

  /**
   * Download image from URL
   */
  async downloadImage(url: string): Promise<Buffer> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 seconds
      });
      return Buffer.from(response.data);
    } catch (error) {
      console.error('Image download error:', error);
      throw new Error('Failed to download image');
    }
  }

  /**
   * Save image to disk
   */
  async saveImage(
    imageBuffer: Buffer,
    filename: string,
    subfolder: string = 'photos'
  ): Promise<string> {
    try {
      const savePath = path.join(this.uploadDir, subfolder, filename);
      await fs.mkdir(path.dirname(savePath), { recursive: true });
      await fs.writeFile(savePath, imageBuffer);
      return savePath;
    } catch (error) {
      console.error('Image save error:', error);
      throw new Error('Failed to save image');
    }
  }

  /**
   * Analyze and store photo evidence
   */
  async processPhotoEvidence(
    photoUrl: string,
    recordId: string
  ): Promise<void> {
    try {
      // Download image
      const imageBuffer = await this.downloadImage(photoUrl);

      // Analyze image
      const analysis = await this.analyzeImage(imageBuffer, recordId);

      // Compress image
      const compressedBuffer = await this.compressImage(imageBuffer);
      const thumbnailBuffer = await this.generateThumbnail(imageBuffer);

      // Save files
      const photoFilename = `${recordId}_${Date.now()}.jpg`;
      const compressedPath = await this.saveImage(compressedBuffer, `compressed_${photoFilename}`);
      const thumbnailPath = await this.saveImage(thumbnailBuffer, `thumb_${photoFilename}`);

      // Update database
      await prisma.photoEvidence.updateMany({
        where: {
          recordId,
          photoUrl,
        },
        data: {
          compressedUrl: compressedPath,
          thumbnailUrl: thumbnailPath,
          hasEXIF: analysis.hasEXIF,
          cameraMake: analysis.metadata?.make,
          cameraModel: analysis.metadata?.model,
          capturedAt: analysis.metadata?.dateTime ? new Date(analysis.metadata.dateTime) : null,
          latitude: analysis.metadata?.gps?.latitude,
          longitude: analysis.metadata?.gps?.longitude,
          altitude: analysis.metadata?.gps?.altitude,
          width: analysis.metadata?.dimensions.width,
          height: analysis.metadata?.dimensions.height,
          pHash: analysis.pHash,
          isDuplicate: analysis.isDuplicate,
          duplicateOf: analysis.duplicateOf,
          fraudFlags: analysis.fraudFlags,
          validityScore: analysis.validityScore,
          analyzedAt: new Date(),
        },
      });

      console.log(`✅ Photo analyzed: ${photoUrl} (validity: ${analysis.validityScore})`);
    } catch (error) {
      console.error('Photo evidence processing error:', error);
      throw error;
    }
  }

  /**
   * Batch process multiple photos
   */
  async batchProcessPhotos(
    photoUrls: string[],
    recordId: string
  ): Promise<{ processed: number; failed: number }> {
    let processed = 0;
    let failed = 0;

    for (const url of photoUrls) {
      try {
        await this.processPhotoEvidence(url, recordId);
        processed++;
      } catch (error) {
        console.error(`Failed to process photo: ${url}`, error);
        failed++;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { processed, failed };
  }
}

// Singleton instance
export const imageService = new ImageService();
