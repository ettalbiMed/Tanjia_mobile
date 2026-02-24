import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middlewares/auth.js';
import { prisma } from '../../lib/prisma.js';
import { paymentGateway, savePaymentResult } from './service.js';

const router = Router();

router.post('/payzone/init', requireAuth, async (req, res) => {
  const parsed = z.object({ orderId: z.string() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid orderId' });
  const order = await prisma.order.findFirst({ where: { id: parsed.data.orderId, userId: req.user!.userId } });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const payload = await paymentGateway.initPayment(order.id);
  await prisma.order.update({ where: { id: order.id }, data: { payzoneOrderRef: payload.reference } });
  res.json(payload);
});

router.post('/payzone/callback', async (req, res) => {
  const parsed = z.object({ orderId: z.string(), orderRef: z.string() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid callback' });
  const order = await savePaymentResult(parsed.data.orderId, parsed.data.orderRef);
  res.json(order);
});

router.get('/payzone/status', requireAuth, async (req, res) => {
  const orderId = String(req.query.orderId || '');
  const order = await prisma.order.findFirst({ where: { id: orderId, userId: req.user!.userId } });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ paymentStatus: order.paymentStatus, payzoneOrderRef: order.payzoneOrderRef });
});

export default router;
