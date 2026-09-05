import { groq } from '../config/groq';

export const extractSkillsAndMetadata = async (transcript: string) => {
  const systemPrompt = `You extract structured JSON metadata from worker transcripts. 
Respond ONLY with valid JSON containing: primaryTrade, specificSkills, estimatedJobValueUGX, clientPhoneNumber, and vvdScore (0-100).`;

  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-20b',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Transcript: "${transcript}"` },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content || '{}';
  return JSON.parse(content);
};