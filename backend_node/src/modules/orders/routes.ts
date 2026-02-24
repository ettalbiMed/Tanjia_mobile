import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { requireAuth } from '../../middlewares/auth.js';

const router = Router();

const createOrderSchema = z.object({
  productId: z.string(),
  quantityKg: z.number().int().min(1),
  notes: z.any().optional(),
  deliveryDate: z.string(),
  deliverySlotId: z.string(),
  name: z.string().min(2),
  phone: z.string(),
  addressText: z.string().min(3),
  city: z.enum(['Rabat', 'Salé', 'Témara']),
  lat: z.number().optional(),
  lng: z.number().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
});

router.post('/', requireAuth, async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.flatten() });

  const data = parsed.data;
  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  const feeSetting = await prisma.setting.findUnique({ where: { key: 'deliveryFee' } });
  if (!product || !feeSetting) return res.status(400).json({ message: 'Config invalide' });

  const subtotal = Number(product.pricePerKg) * data.quantityKg;
  const deliveryFee = Number(feeSetting.value);
  const order = await prisma.order.create({
    data: {
      userId: req.user!.userId,
      status: OrderStatus.PENDING,
      city: data.city,
      deliveryDate: new Date(data.deliveryDate),
      deliverySlotId: data.deliverySlotId,
      addressText: data.addressText,
      lat: data.lat,
      lng: data.lng,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === PaymentMethod.COD ? PaymentStatus.UNPAID : PaymentStatus.PENDING,
      items: {
        create: {
          productId: data.productId,
          quantityKg: data.quantityKg,
          unitPrice: product.pricePerKg,
          optionsJson: data.notes,
        },
      },
    },
    include: { items: true },
  });

  res.status(201).json(order);
});

router.get('/', requireAuth, async (req, res) => {
  const orders = await prisma.order.findMany({ where: { userId: req.user!.userId }, include: { items: true }, orderBy: { createdAt: 'desc' } });
  res.json(orders);
});

router.get('/:id', requireAuth, async (req, res) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: req.user!.userId }, include: { items: true } });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

export default router;
