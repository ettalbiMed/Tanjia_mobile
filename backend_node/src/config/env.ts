import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  adminSessionSecret: process.env.ADMIN_SESSION_SECRET || 'admin-secret',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || '$2a$10$ga0u0Y7gnPZXoqBYwygJy.C6QnwrYfYMUIrMFDEkOiYzfoalGoY/y', // admin123
  payzoneMode: process.env.PAYZONE_MODE || 'mock',
  payzonePublicBaseUrl: process.env.PAYZONE_PUBLIC_BASE_URL || 'https://mock-payzone.local',
  firebaseServiceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
};
