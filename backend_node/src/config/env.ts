import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);
const backendRootEnvPath = path.resolve(currentDirPath, '../../.env');

dotenv.config({ path: backendRootEnvPath });

type EnvValue = string | undefined;

const cleanEnv = (value: EnvValue) => value?.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');

export const env = {
  port: Number(cleanEnv(process.env.PORT) || 4000),
  jwtSecret: cleanEnv(process.env.JWT_SECRET) || 'dev-secret',
  adminSessionSecret: cleanEnv(process.env.ADMIN_SESSION_SECRET) || 'admin-secret',
  adminUsername: cleanEnv(process.env.ADMIN_USERNAME) || 'admin',
  adminPasswordHash: cleanEnv(process.env.ADMIN_PASSWORD_HASH) || '$2a$10$ga0u0Y7gnPZXoqBYwygJy.C6QnwrYfYMUIrMFDEkOiYzfoalGoY/y', // admin123
  adminPasswordPlain: cleanEnv(process.env.ADMIN_PASSWORD),
  payzoneMode: cleanEnv(process.env.PAYZONE_MODE) || 'mock',
  payzonePublicBaseUrl: cleanEnv(process.env.PAYZONE_PUBLIC_BASE_URL) || 'https://mock-payzone.local',
  firebaseServiceAccountJson: cleanEnv(process.env.FIREBASE_SERVICE_ACCOUNT_JSON),
};
