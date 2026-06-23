import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe a senha.')
});

export const newTicketSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome.').max(120),
  email: z.string().email('Informe um e-mail válido.'),
  institution: z.string().trim().max(160).optional().or(z.literal('')),
  message: z.string().trim().min(5, 'Descreva sua solicitação.').max(4000)
});

export const finalizeTicketSchema = z.object({
  reply: z.string().trim().min(3, 'Escreva uma resposta para o usuário.').max(4000)
});

export const newAudioSchema = z.object({
  title: z.string().trim().min(2, 'Informe um título para o áudio.').max(120),
  fileUrl: z.string().trim().min(1, 'Informe o arquivo de áudio.'),
  emoji: z.string().trim().max(8).optional()
});
