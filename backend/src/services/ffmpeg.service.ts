import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const processAudioWithFFmpeg = (inputPath: string): Promise<string> => {
  const outputPath = `${inputPath}_converted.wav`;

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('wav')
      .audioChannels(1)
      .audioFrequency(16000)
      .on('end', () => resolve(outputPath))
      .on('error', (err: Error) => reject(err))
      .save(outputPath);
  });
};