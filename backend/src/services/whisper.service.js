"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcribeAudio = void 0;
const fs_1 = __importDefault(require("fs"));
const groq_1 = require("../config/groq");
const transcribeAudio = async (filePath) => {
    try {
        console.log('🎙️ Transcribing:', filePath);
        const fileStream = fs_1.default.createReadStream(filePath);
        const response = await groq_1.groq.audio.transcriptions.create({
            file: fileStream,
            model: 'whisper-large-v3',
            language: 'en',
            response_format: 'text',
            temperature: 0,
        });
        console.log('📝 Whisper response:', response);
        return typeof response === 'string'
            ? response
            : response.text;
    }
    catch (error) {
        console.error('Whisper Service Error:', error);
        throw new Error(`Whisper Transcription Error: ${error.message}`);
    }
};
exports.transcribeAudio = transcribeAudio;
//# sourceMappingURL=whisper.service.js.map