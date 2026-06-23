import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword } from '@/lib/adminRepository';
import { ADMIN_COOKIE_MAX_AGE, ADMIN_COOKIE_NAME, signAdminSession } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;
  const isValid = await verifyAdminPassword(email, password);

  if (!isValid) {
    return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
  }

  const token = signAdminSession({ email: email.toLowerCase() });
  const response = NextResponse.json({ ok: true });

  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_COOKIE_MAX_AGE
  });

  return response;
}
