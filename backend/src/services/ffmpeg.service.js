"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAudioWithFFmpeg = void 0;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ffmpeg_1 = __importDefault(require("@ffmpeg-installer/ffmpeg"));
fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_1.default.path);
const processAudioWithFFmpeg = (inputPath) => {
    const outputPath = `${inputPath}_converted.wav`;
    return new Promise((resolve, reject) => {
        (0, fluent_ffmpeg_1.default)(inputPath)
            .toFormat('wav')
            .audioChannels(1)
            .audioFrequency(16000)
            .on('end', () => resolve(outputPath))
            .on('error', (err) => reject(err))
            .save(outputPath);
    });
};
exports.processAudioWithFFmpeg = processAudioWithFFmpeg;
//# sourceMappingURL=ffmpeg.service.js.map