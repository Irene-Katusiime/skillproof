import { Router, Request, Response } from 'express';
import { generateSkillQuiz } from '../services/quiz.service';

const router = Router();

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const primaryTrade = String(req.body.primaryTrade || '').trim();

    const skills = Array.isArray(req.body.skills)
      ? req.body.skills.map((skill: unknown) => String(skill).trim()).filter(Boolean)
      : [];

    if (!primaryTrade && skills.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No trade or skills provided.',
      });
    }

    const questions = await generateSkillQuiz(primaryTrade, skills);

    return res.status(200).json({
      success: true,
      questions,
    });
  } catch (error: any) {
    console.error('Quiz Generation Error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate skill quiz.',
    });
  }
});

export default router;
