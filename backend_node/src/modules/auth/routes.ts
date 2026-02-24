import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { signJwt } from '../../lib/jwt.js';

const router = Router();

const phoneSchema = z.string().min(8);

router.post('/request-otp', (req, res) => {
  const parsed = phoneSchema.safeParse(req.body.phone);
  if (!parsed.success) return res.status(400).json({ message: 'Téléphone invalide' });
  return res.json({ message: 'OTP mock envoyé', otp: '123456' });
});

router.post('/verify-otp', async (req, res) => {
  const schema = z.object({ phone: phoneSchema, name: z.string().optional(), otp: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success || parsed.data.otp !== '123456') return res.status(400).json({ message: 'OTP invalide' });

  const user = await prisma.user.upsert({
    where: { phone: parsed.data.phone },
    update: { name: parsed.data.name },
    create: { phone: parsed.data.phone, name: parsed.data.name },
  });

  return res.json({ token: signJwt({ userId: user.id, phone: user.phone }), user });
});

export default router;
