"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const ffmpeg_service_1 = require("../services/ffmpeg.service");
const whisper_service_1 = require("../services/whisper.service");
const sunbird_service_1 = require("../services/sunbird.service");
const skillExtractor_service_1 = require("../services/skillExtractor.service");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    dest: path_1.default.join(process.cwd(), 'uploads'),
    limits: { fileSize: 25 * 1024 * 1024 },
});
router.post('/voice', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No audio file provided.',
            });
        }
        const inputPath = req.file.path;
        // URL of the original uploaded audio file.
        // The server exposes /uploads through express.static().
        const audioUrl = `/uploads/${req.file.filename}`;
        // 1. Convert/normalize audio
        const normalizedAudioPath = await (0, ffmpeg_service_1.processAudioWithFFmpeg)(inputPath);
        // 2. Transcribe voice audio via Whisper
        const rawTranscript = await (0, whisper_service_1.transcribeAudio)(normalizedAudioPath);
        // 3. Translate from Luganda to English via Sunbird
        const sourceLang = req.body.sourceLang || 'lug';
        const translatedTranscript = await (0, sunbird_service_1.translateWithSunbird)(rawTranscript, sourceLang, 'eng');
        // 4. Extract structured metadata from English translation
        const extractedData = await (0, skillExtractor_service_1.extractSkillsAndMetadata)(translatedTranscript);
        return res.status(200).json({
            success: true,
            audioUrl,
            rawTranscript,
            translatedTranscript,
            data: extractedData,
        });
    }
    catch (error) {
        console.error('Ingestion Pipeline Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message ||
                'An internal pipeline error occurred.',
        });
    }
});
exports.default = router;
//# sourceMappingURL=ingest.routes.js.map