import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';

const router = Router();

router.get('/', async (_req, res) => {
  const slots = await prisma.deliverySlot.findMany({ where: { active: true } });
  res.json(slots);
});

export default router;
