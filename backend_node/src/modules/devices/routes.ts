import { DevicePlatform } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { requireAuth } from '../../middlewares/auth.js';

const router = Router();

router.post('/register', requireAuth, async (req, res) => {
  const parsed = z.object({ token: z.string(), platform: z.nativeEnum(DevicePlatform) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });
  const device = await prisma.device.upsert({
    where: { token: parsed.data.token },
    update: { userId: req.user!.userId, platform: parsed.data.platform, lastSeenAt: new Date() },
    create: { userId: req.user!.userId, token: parsed.data.token, platform: parsed.data.platform },
  });
  res.json(device);
});

export default router;
