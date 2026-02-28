import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type JwtPayload = { userId: string; phone: string };

export const signJwt = (payload: JwtPayload) => jwt.sign(payload, env.jwtSecret, { expiresIn: '30d' });
export const verifyJwt = (token: string) => jwt.verify(token, env.jwtSecret) as JwtPayload;
