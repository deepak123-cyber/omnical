import { Request, Response, Router } from 'express';
import { generateGraphPoints, AngleMode } from '../calc/evaluator.js';

export const graphRouter = Router();

graphRouter.post('/', (req: Request, res: Response) => {
  try {
    const {
      expression,
      angleMode = 'rad',
      xMin = -10,
      xMax = 10,
      points = 250,
    } = req.body;

    if (typeof expression !== 'string' || expression.trim().length === 0) {
      return res.status(400).json({ error: 'Expression string is required' });
    }

    if (expression.length > 500) {
      return res.status(400).json({ error: 'Expression exceeds 500 characters' });
    }

    const minNum = Number(xMin);
    const maxNum = Number(xMax);
    const pointsNum = Math.min(1000, Math.max(20, Number(points) || 250));

    if (!Number.isFinite(minNum) || !Number.isFinite(maxNum)) {
      return res.status(400).json({ error: 'xMin and xMax must be valid numbers' });
    }

    if (minNum >= maxNum) {
      return res.status(400).json({ error: 'xMin must be strictly less than xMax' });
    }

    const mode: AngleMode = angleMode === 'deg' ? 'deg' : 'rad';
    const graphData = generateGraphPoints(expression, mode, minNum, maxNum, pointsNum);

    return res.json(graphData);
  } catch (err: any) {
    const message = err?.message || 'Graph evaluation error';
    return res.status(400).json({ error: message });
  }
});
