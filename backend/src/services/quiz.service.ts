import { groq } from '../config/groq';

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export const generateSkillQuiz = async (
  primaryTrade: string,
  skills: string[]
): Promise<QuizQuestion[]> => {
  const systemPrompt = `
You are a professional vocational skills assessment AI for SkillProof.

Generate a short practical knowledge quiz for an informal worker.

The quiz MUST be based ONLY on the worker's actual trade and skills provided below.

Do NOT use questions from another profession.
Do NOT default to tailoring, beauty, fashion, construction, mechanics, or any other trade unless the worker's trade or skills indicate it.

Return ONLY valid JSON in this exact structure:

{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correct": 0
    }
  ]
}

Rules:
- Generate exactly 3 questions.
- Each question must have exactly 4 options.
- "correct" must be the zero-based index of the correct option.
- Questions must test practical knowledge relevant to the worker's trade.
- Avoid overly academic questions.
- Do not invent a different profession.
- Do not mention that you are an AI.
- Make the questions appropriate for a skilled informal worker in Uganda.
`;

  const userPrompt = `
Worker's primary trade:
${primaryTrade || 'Not specified'}

Worker's identified skills:
${skills.length ? skills.join(', ') : 'Not specified'}

Generate the 3-question skills assessment now.
`;

  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-20b',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content || '{}';
  const parsed = JSON.parse(content);

  if (
    !parsed.questions ||
    !Array.isArray(parsed.questions) ||
    parsed.questions.length !== 3
  ) {
    throw new Error('AI returned an invalid quiz.');
  }

  return parsed.questions.map((q: any) => ({
    question: String(q.question),
    options: Array.isArray(q.options)
      ? q.options.slice(0, 4).map((option: unknown) => String(option))
      : [],
    correct: Number(q.correct),
  }));
};
