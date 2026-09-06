import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import sharp from 'sharp';
import { processAudioWithFFmpeg } from '../services/ffmpeg.service';
import { transcribeAudio } from '../services/whisper.service';
import { translateWithSunbird } from '../services/sunbird.service';
import { extractSkillsAndMetadata } from '../services/skillExtractor.service';

const router = Router();

// ── Shared upload directory ───────────────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '../../uploads/');

const upload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: 25 * 1024 * 1024 },
});

// ── Frame upload: up to 3 image files, max 8 MB each ─────────────────────────
const FRAMES_DIR = path.join(UPLOAD_DIR, 'frames/');

// Ensure the frames sub-directory exists at startup
if (!fs.existsSync(FRAMES_DIR)) {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
}

const frameUpload = multer({
  dest: FRAMES_DIR,
  limits: {
    files: 3,
    fileSize: 8 * 1024 * 1024, // 8 MB per frame
  },
  fileFilter: (_req, file, cb) => {
    // Accept JPEG and PNG only
    if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported image type: ${file.mimetype}`));
    }
  },
});

router.post('/voice', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No audio file provided.' });
    }

    const inputPath = req.file.path;

    // 1. Convert audio
    const normalizedAudioPath = await processAudioWithFFmpeg(inputPath);

    // 2. Transcribe voice audio via Whisper
    const rawTranscript = await transcribeAudio(normalizedAudioPath);

    // 3. Translate from Luganda (lug) to English (eng) via Sunbird
    const sourceLang = (req.body.sourceLang as string) || 'lug';
    const translatedTranscript = await translateWithSunbird(rawTranscript, sourceLang, 'eng');

    // 4. Extract structured JSON metadata from English translation
    const extractedData = await extractSkillsAndMetadata(translatedTranscript);

    return res.status(200).json({
      success: true,
      rawTranscript,
      translatedTranscript,
      data: extractedData,
    });
  } catch (error: any) {
    console.error('Ingestion Pipeline Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An internal pipeline error occurred.',
    });
  }
});

// ── POST /api/ingest/frames ───────────────────────────────────────────────────
// Accepts up to 3 image files in the 'frames' field.
// Each file is compressed to ≤ 800 px wide JPEG and saved to uploads/frames/.
// Responds with metadata for each stored frame.
//
// Expected multipart fields:
//   frames   (file)   – up to 3 image files
//   slots    (text[]) – slot names: 'face' | 'idCard' | 'workEnv'
//   recordId (text)   – optional skill-record ID to associate frames with
// ─────────────────────────────────────────────────────────────────────────────

const VALID_SLOTS = ['face', 'idCard', 'workEnv'] as const;
type FrameSlot = typeof VALID_SLOTS[number];

interface FrameMeta {
  slot: FrameSlot;
  fileSize: number;
  mimeType: string;
  storedPath: string;
  capturedAt: string;
}

router.post(
  '/frames',
  frameUpload.array('frames', 3),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[] | undefined;

      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, error: 'No frame files provided.' });
      }

      if (files.length !== 3) {
        return res.status(400).json({
          success: false,
          error: `Expected exactly 3 frames, received ${files.length}.`,
        });
      }

      // Resolve slots from body — may arrive as a string or string[]
      const rawSlots = req.body.slots;
      const slots: string[] = Array.isArray(rawSlots)
        ? rawSlots
        : typeof rawSlots === 'string'
        ? [rawSlots]
        : [];

      // Validate slot names
      for (const s of slots) {
        if (!VALID_SLOTS.includes(s as FrameSlot)) {
          return res.status(400).json({
            success: false,
            error: `Invalid slot name "${s}". Must be one of: ${VALID_SLOTS.join(', ')}.`,
          });
        }
      }

      const recordId  = (req.body.recordId as string | undefined) || undefined;
      const capturedAt = new Date().toISOString();
      const results: FrameMeta[] = [];

      // Process each frame: compress with sharp and rename to a content-addressed path
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const slot = (slots[i] as FrameSlot) ?? (`frame${i}` as FrameSlot);

        // Generate a unique filename: sha256 of original content + slot
        const rawBuffer  = fs.readFileSync(file.path);
        const hash       = crypto.createHash('sha256').update(rawBuffer).digest('hex').slice(0, 16);
        const finalName  = `${slot}-${hash}.jpg`;
        const finalPath  = path.join(FRAMES_DIR, finalName);

        // Compress: resize to max 800 px wide, convert to JPEG quality 82
        await sharp(file.path)
          .resize({ width: 800, withoutEnlargement: true })
          .jpeg({ quality: 82, progressive: true })
          .toFile(finalPath);

        // Remove multer's temp file now that we have the processed version
        fs.unlinkSync(file.path);

        const stat = fs.statSync(finalPath);

        results.push({
          slot,
          fileSize:   stat.size,
          mimeType:   'image/jpeg',
          storedPath: `uploads/frames/${finalName}`,
          capturedAt,
        });
      }

      console.log(
        `[frames] Stored ${results.length} frames${recordId ? ` for record ${recordId}` : ''}`,
        results.map(r => `${r.slot} → ${r.storedPath} (${(r.fileSize / 1024).toFixed(1)} KB)`),
      );

      return res.status(200).json({
        success:    true,
        frameCount: results.length,
        recordId,
        frames:     results,
      });

    } catch (error: any) {
      console.error('[frames] Ingest error:', error);
      return res.status(500).json({
        success: false,
        error:   error.message || 'An internal error occurred processing the frames.',
      });
    }
  },
);

export default router;