import fs from 'fs';
import { groq } from '../config/groq';

export const transcribeAudio = async (filePath: string): Promise<string> => {
  try {
    const fileStream = fs.createReadStream(filePath);

    const response = await groq.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-large-v3-turbo',
      response_format: 'text',
      temperature: 0.0,
    });

    return typeof response === 'string' ? response : (response as any).text;
  } catch (error: any) {
    console.error('Whisper Service Error:', error);
    throw new Error(`Whisper Transcription Error: ${error.message}`);
  }
};