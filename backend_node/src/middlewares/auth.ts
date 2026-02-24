import { NextFunction, Request, Response } from 'express';
import { verifyJwt } from '../lib/jwt.js';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = verifyJwt(auth.split(' ')[1]!);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
