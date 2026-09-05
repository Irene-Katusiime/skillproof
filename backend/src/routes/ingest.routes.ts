import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { processAudioWithFFmpeg } from '../services/ffmpeg.service';
import { transcribeAudio } from '../services/whisper.service';
import { translateWithSunbird } from '../services/sunbird.service';
import { extractSkillsAndMetadata } from '../services/skillExtractor.service';

const router = Router();

const upload = multer({
  dest: path.join(__dirname, '../../uploads/'),
  limits: { fileSize: 25 * 1024 * 1024 },
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

export default router;