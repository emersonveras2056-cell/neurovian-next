import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';
import { jwtVerify } from 'jose'; 
/**
 * Protege todas as rotas administrativas. O usuário público nunca
 * passa por aqui, pois ele não tem login nem rotas protegidas -
 * apenas o formulário público e a leitura dos áudios.
 */
export async function middleware(request: NextRequest) { // 👈 Mudou para async
  const isProtectedPage = request.nextUrl.pathname.startsWith('/admin/dashboard');
  const isProtectedApi =
    (request.nextUrl.pathname.startsWith('/api/tickets') && request.method !== 'POST')
      ? true
      : request.nextUrl.pathname.startsWith('/api/audios') && request.method !== 'GET';

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  let hasValidSession = false;

  if (token) {
    try {
      // Valida o token usando o jose de forma perfeitamente compatível com o Middleware
      const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
      await jwtVerify(token, secret);
      hasValidSession = true;
    } catch (error) {
      console.error("Erro ao validar JWT no Middleware:", error);
      hasValidSession = false;
    }
  }

  if (!hasValidSession) {
    if (isProtectedPage) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*', '/api/tickets/:path*', '/api/audios/:path*'],
};