'use client';

import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'sending' | 'success' | 'error';

/**
 * Formulário público de contato. Não exige nenhum tipo de login ou
 * conta de usuário — apenas os dados necessários para o admin poder
 * responder por e-mail e encerrar o atendimento.
 */
export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    const form = event.currentTarget;
    const payload = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      institution: (form.elements.namedItem('company') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value
    };

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? 'Não foi possível enviar sua mensagem.');
      }

      setStatus('success');
      form.reset();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erro inesperado.');
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <label htmlFor="name">Nome</label>
      <input type="text" id="name" name="name" placeholder="Seu nome" required />

      <label htmlFor="email">Email</label>
      <input type="email" id="email" name="email" placeholder="seu@email.com" required />

      <label htmlFor="company">Instituição / Projeto</label>
      <input type="text" id="company" name="company" placeholder="Nome da instituição ou projeto" />

      <label htmlFor="message">Mensagem</label>
      <textarea id="message" name="message" rows={5} placeholder="Escreva sua mensagem" required />

      <button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Enviando...' : 'Enviar mensagem'}
      </button>

      {status === 'success' && (
        <p className="form-feedback form-feedback--success">
          Mensagem enviada! Nossa equipe responderá por e-mail em breve.
        </p>
      )}
      {status === 'error' && (
        <p className="form-feedback form-feedback--error">{errorMessage}</p>
      )}
    </form>
  );
}
