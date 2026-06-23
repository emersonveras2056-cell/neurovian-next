'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const form = event.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? 'Não foi possível entrar.');
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login">
      {loading && <div className="top-loading-bar" />}

      <form className="admin-login-card" onSubmit={handleSubmit}>
        {/* Logo + nome no topo */}
        <div className="admin-login-logo">
          <img src="/imagens/logo_neurovian_principal.png" alt="Logo Neurovian" />
          <h1>Neurovian</h1>
        </div>

        <p>Acesso restrito ao painel administrativo.</p>

        <label htmlFor="email">E-mail</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          autoFocus
          placeholder="admin@neurovian.com"
        />

        <label htmlFor="password">Senha</label>
        <div className="password-field">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            required
            placeholder="••••••••"
          />
          <button
            type="button"
            className="password-toggle"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? (
              /* Olho fechado */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              /* Olho aberto */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar no painel'}
        </button>

        {error && <p className="form-feedback form-feedback--error">{error}</p>}
      </form>
    </main>
  );
}
