import bcrypt from 'bcryptjs';
import { OrderStatus } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { getStatusMessage, sendPushToUser } from '../notifications/service.js';

const router = Router();

const guard = (req: any, res: any, next: any) => {
  if (!req.session?.adminLogged) return res.status(401).json({ message: 'Admin unauthorized' });
  next();
};

router.post('/login', async (req, res) => {
  const parsed = z.object({ username: z.string(), password: z.string() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Bad credentials' });
  const passwordMatches = env.adminPasswordPlain
    ? parsed.data.password === env.adminPasswordPlain
    : await bcrypt.compare(parsed.data.password, env.adminPasswordHash);
  const ok = parsed.data.username === env.adminUsername && passwordMatches;
  if (!ok) return res.status(401).json({ message: 'Bad credentials' });
  req.session.adminLogged = true;
  res.json({ message: 'Connected' });
});

router.post('/logout', guard, (req, res) => req.session.destroy(() => res.json({ message: 'Logout ok' })));

router.get('/orders', guard, async (req, res) => {
  const { status, city } = req.query;
  const orders = await prisma.order.findMany({
    where: { status: status as OrderStatus | undefined, city: city as string | undefined },
    include: { user: true, items: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
});

router.get('/orders/:id', guard, async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { user: true, items: true } });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

router.patch('/orders/:id/status', guard, async (req, res) => {
  const parsed = z.object({ status: z.nativeEnum(OrderStatus) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Status invalide' });
  const order = await prisma.order.update({ where: { id: req.params.id }, data: { status: parsed.data.status } });
  await sendPushToUser(order.userId, 'Bayt Tanjia', getStatusMessage(parsed.data.status), { orderId: order.id, status: parsed.data.status });
  await prisma.notificationLog.updateMany({ where: { userId: order.userId, orderId: null }, data: { orderId: order.id } });
  res.json(order);
});

router.post('/notifications/send', guard, async (req, res) => {
  const parsed = z.object({ userId: z.string().optional(), orderId: z.string().optional(), title: z.string(), body: z.string() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });
  let userId = parsed.data.userId;
  if (!userId && parsed.data.orderId) {
    const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
    userId = order?.userId;
  }
  if (!userId) return res.status(400).json({ message: 'userId ou orderId requis' });
  await sendPushToUser(userId, parsed.data.title, parsed.data.body, parsed.data.orderId ? { orderId: parsed.data.orderId } : undefined);
  res.json({ message: 'Notification envoyée' });
});

router.get('/notifications/logs', guard, async (_req, res) => {
  const logs = await prisma.notificationLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json(logs);
});

export default router;
