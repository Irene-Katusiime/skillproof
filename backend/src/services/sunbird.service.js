"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateWithSunbird = void 0;
const axios_1 = __importDefault(require("axios"));
const translateWithSunbird = async (text, sourceLang = 'lug', targetLang = 'eng') => {
    if (!text || !text.trim()) {
        return text;
    }
    try {
        const payload = {
            source_language: sourceLang,
            target_language: targetLang,
            text: text,
        };
        const response = await axios_1.default.post('https://api.sunbird.ai/tasks/translate', payload, {
            headers: {
                Authorization: `Bearer ${process.env.SUNBIRD_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        // Extract returned translated text from Sunbird Sunflower output structure
        return (response.data?.output?.translated_text ||
            response.data?.translated_text ||
            response.data?.text ||
            text);
    }
    catch (error) {
        console.error('Sunbird Translation Error:', error?.response?.data || error.message);
        // Return raw text as fallback so the remaining pipeline is not blocked
        return text;
    }
};
exports.translateWithSunbird = translateWithSunbird;
//# sourceMappingURL=sunbird.service.js.map