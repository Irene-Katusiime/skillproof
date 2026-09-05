import axios from 'axios';

interface SunbirdTranslatePayload {
  source_language?: string;
  target_language: string;
  text: string;
}

export const translateWithSunbird = async (
  text: string,
  sourceLang: string = 'lug',
  targetLang: string = 'eng'
): Promise<string> => {
  if (!text || !text.trim()) {
    return text;
  }

  try {
    const payload: SunbirdTranslatePayload = {
      source_language: sourceLang,
      target_language: targetLang,
      text: text,
    };

    const response = await axios.post(
      'https://api.sunbird.ai/tasks/translate',
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.SUNBIRD_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Extract returned translated text from Sunbird Sunflower output structure
    return (
      response.data?.output?.translated_text ||
      response.data?.translated_text ||
      response.data?.text ||
      text
    );
  } catch (error: any) {
    console.error(
      'Sunbird Translation Error:',
      error?.response?.data || error.message
    );
    // Return raw text as fallback so the remaining pipeline is not blocked
    return text;
  }
};
