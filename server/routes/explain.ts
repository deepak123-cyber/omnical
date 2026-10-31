import { Request, Response, Router } from 'express';
import { GoogleGenAI } from '@google/genai';

export const explainRouter = Router();

explainRouter.get('/status', (_req: Request, res: Response) => {
  const isAvailable = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  res.json({ available: isAvailable });
});

explainRouter.post('/', async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim().length === 0) {
    return res.status(503).json({
      error: 'Gemini API key is not configured on the server. Please attach GEMINI_API_KEY in the Secrets panel.',
    });
  }

  const { expression, result } = req.body;

  if (!expression || typeof expression !== 'string') {
    return res.status(400).json({ error: 'Valid expression is required' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are a concise, helpful mathematics teacher. Explain step-by-step how to evaluate the following mathematical expression in 2 to 4 clear, brief bullet points.

Expression: ${expression}
Result: ${result ?? 'Evaluated'}

Formatting guidelines:
- Keep the explanation brief, high school level, friendly, and crystal clear.
- Note any order of operations (PEMDAS), properties of functions (e.g. trig, roots, factorials), or scientific constants used.
- Do not use markdown headers or verbose fluff.`;

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI explanation timed out. Please check your network or try again.')), 10000)
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const explanation = response.text || 'No explanation generated.';
    return res.json({ explanation });
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message || 'Failed to generate step-by-step mathematical explanation.',
    });
  }
});
