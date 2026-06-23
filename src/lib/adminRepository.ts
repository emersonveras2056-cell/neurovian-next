import bcrypt from 'bcryptjs';
import { readJsonFile, writeJsonFile } from './jsonStore';

export interface AdminRecord {
  email: string;
  passwordHash: string;
  createdAt: string;
}

const FILE_NAME = 'admin.json';

/**
 * O sistema foi projetado para ter SOMENTE UM administrador.
 * Por isso este arquivo guarda um único objeto (não uma lista).
 * Ele é criado pelo script "npm run seed:admin" (scripts/seed-admin.js).
 */
export function getAdmin(): AdminRecord | null {
  const data = readJsonFile<AdminRecord | null>(FILE_NAME, null);
  return data;
}

export function adminExists(): boolean {
  return getAdmin() !== null;
}

/**
 * Cria o admin único. Lança erro se já existir um admin, pois o
 * sistema não permite múltiplos administradores.
 */
export async function createAdmin(email: string, plainPassword: string): Promise<AdminRecord> {
  if (adminExists()) {
    throw new Error('Já existe um administrador cadastrado. Apenas 1 admin é permitido.');
  }

  const passwordHash = await bcrypt.hash(plainPassword, 12);
  const record: AdminRecord = {
    email: email.trim().toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString()
  };

  writeJsonFile(FILE_NAME, record);
  return record;
}

export async function verifyAdminPassword(email: string, plainPassword: string): Promise<boolean> {
  const admin = getAdmin();
  if (!admin) return false;
  if (admin.email !== email.trim().toLowerCase()) return false;

  return bcrypt.compare(plainPassword, admin.passwordHash);
}

/**
 * Permite ao admin trocar a própria senha a partir do painel.
 */
export async function updateAdminPassword(newPlainPassword: string): Promise<void> {
  const admin = getAdmin();
  if (!admin) throw new Error('Nenhum administrador cadastrado.');

  admin.passwordHash = await bcrypt.hash(newPlainPassword, 12);
  writeJsonFile(FILE_NAME, admin);
}
