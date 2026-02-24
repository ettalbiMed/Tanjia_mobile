import { PaymentStatus } from '@prisma/client';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';

export interface PaymentGateway {
  initPayment(orderId: string): Promise<{ paymentUrl: string; reference: string }>;
  verifyPayment(orderRef: string): Promise<{ status: PaymentStatus; transactionId?: string }>;
}

class PayzoneGateway implements PaymentGateway {
  async initPayment(orderId: string) {
    const reference = `PZ-${orderId}`;
    return { paymentUrl: `${env.payzonePublicBaseUrl}/pay/${reference}`, reference };
  }
  async verifyPayment(orderRef: string) {
    return { status: PaymentStatus.PAID, transactionId: `TXN-${orderRef}` };
  }
}

export const paymentGateway: PaymentGateway = new PayzoneGateway();

export async function savePaymentResult(orderId: string, orderRef: string) {
  const result = await paymentGateway.verifyPayment(orderRef);
  return prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: result.status, payzoneOrderRef: orderRef, payzoneTransactionId: result.transactionId },
  });
}
