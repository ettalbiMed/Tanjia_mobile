import admin from 'firebase-admin';
import { NotificationStatus, OrderStatus } from '@prisma/client';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';

let firebaseReady = false;
if (env.firebaseServiceAccountJson) {
  const creds = JSON.parse(env.firebaseServiceAccountJson);
  admin.initializeApp({ credential: admin.credential.cert(creds) });
  firebaseReady = true;
}

const statusMessage: Partial<Record<OrderStatus, string>> = {
  CONFIRMED: 'Votre commande est confirmée ✅',
  PREPARING: 'Votre Tangia est en préparation 🍲',
  OUT_FOR_DELIVERY: 'Votre commande est en route 🚚',
  DELIVERED: 'Bon appétit ! Commande livrée 😋',
  CANCELLED: 'Votre commande a été annulée',
};

export const getStatusMessage = (status: OrderStatus) => statusMessage[status] ?? 'Mise à jour de votre commande';

export async function sendPushToUser(userId: string, title: string, body: string, data?: Record<string, string>) {
  const devices = await prisma.device.findMany({ where: { userId } });
  let error: string | null = null;

  if (firebaseReady && devices.length) {
    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens: devices.map((d) => d.token),
        notification: { title, body },
        data,
      });
      const invalids = response.responses
        .map((r, idx) => (!r.success ? devices[idx]?.token : null))
        .filter(Boolean) as string[];
      if (invalids.length) {
        await prisma.device.deleteMany({ where: { token: { in: invalids } } });
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown FCM error';
    }
  }

  await prisma.notificationLog.create({
    data: {
      userId,
      title,
      body,
      dataJson: data ?? undefined,
      status: error ? NotificationStatus.FAILED : NotificationStatus.SENT,
      errorMessage: error ?? undefined,
    },
  });
}
