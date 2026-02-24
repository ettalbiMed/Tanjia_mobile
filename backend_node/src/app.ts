import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error.js';
import adminRoutes from './modules/admin/routes.js';
import authRoutes from './modules/auth/routes.js';
import deliverySlotRoutes from './modules/deliverySlots/routes.js';
import deviceRoutes from './modules/devices/routes.js';
import orderRoutes from './modules/orders/routes.js';
import paymentRoutes from './modules/payments/routes.js';
import productRoutes from './modules/products/routes.js';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(session({ secret: env.adminSessionSecret, resave: false, saveUninitialized: false, cookie: { httpOnly: true } }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/delivery-slots', deliverySlotRoutes);
app.use('/devices', deviceRoutes);
app.use('/orders', orderRoutes);
app.use('/payments', paymentRoutes);
app.use('/admin', adminRoutes);
app.use(errorHandler);
