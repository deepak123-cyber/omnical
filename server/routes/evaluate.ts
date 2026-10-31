import { Request, Response, Router } from 'express';
import { evaluateExpression, AngleMode } from '../calc/evaluator.js';

export const evaluateRouter = Router();

evaluateRouter.post('/', (req: Request, res: Response) => {
  try {
    const { expression, angleMode = 'deg' } = req.body;

    if (typeof expression !== 'string' || expression.trim().length === 0) {
      return res.status(400).json({ error: 'Expression string is required' });
    }

    if (expression.length > 500) {
      return res.status(400).json({ error: 'Expression exceeds 500 characters' });
    }

    const mode: AngleMode = angleMode === 'rad' ? 'rad' : 'deg';
    const output = evaluateExpression(expression, mode);

    return res.json(output);
  } catch (err: any) {
    const message = err?.message || 'Calculation error';
    return res.status(400).json({ error: message });
  }
});
