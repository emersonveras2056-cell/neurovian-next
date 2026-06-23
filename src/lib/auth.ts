import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'neurovian_admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 8; // 8 horas

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      'AUTH_SECRET não definido. Configure a variável de ambiente no arquivo .env.local'
    );
  }
  return secret;
}

export interface AdminSessionPayload {
  email: string;
}

export function signAdminSession(payload: AdminSessionPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '8h' });
}

export function verifyAdminSession(token: string): AdminSessionPayload | null {
  try {
    return jwt.verify(token, getSecret()) as AdminSessionPayload;
  } catch {
    return null;
  }
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE = SESSION_DURATION_SECONDS;
