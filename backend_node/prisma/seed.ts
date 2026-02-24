import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.upsert({
    where: { id: 'seed-tangia' },
    update: {},
    create: {
      id: 'seed-tangia',
      name: 'Tangia',
      description: 'Tangia marocaine premium',
      pricePerKg: 200,
      active: true,
    },
  });

  const slots = [
    { id: 'slot-midi', label: '12:00 - 14:00', startTime: '12:00', endTime: '14:00' },
    { id: 'slot-apresmidi', label: '14:00 - 17:00', startTime: '14:00', endTime: '17:00' },
    { id: 'slot-soir', label: '19:00 - 22:00', startTime: '19:00', endTime: '22:00' },
  ];

  for (const slot of slots) {
    await prisma.deliverySlot.upsert({ where: { id: slot.id }, update: {}, create: slot });
  }

  await prisma.setting.upsert({
    where: { key: 'deliveryFee' },
    update: { value: 15 },
    create: { key: 'deliveryFee', value: 15 },
  });

  await prisma.setting.upsert({
    where: { key: 'allowedCities' },
    update: { value: ['Rabat', 'Salé', 'Témara'] },
    create: { key: 'allowedCities', value: ['Rabat', 'Salé', 'Témara'] },
  });
}

main().finally(() => prisma.$disconnect());
