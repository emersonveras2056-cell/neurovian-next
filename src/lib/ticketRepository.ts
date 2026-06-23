import { v4 as uuid } from 'uuid';
import { readJsonFile, writeJsonFile } from './jsonStore';

export type TicketStatus = 'pendente' | 'em_atendimento' | 'finalizado';

export interface Ticket {
  id: string;
  name: string;
  email: string;
  institution?: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
  /** Preenchido quando o admin responde/finaliza o atendimento. */
  adminReply?: string;
  resolvedAt?: string;
}

const FILE_NAME = 'tickets.json';

function readAll(): Ticket[] {
  return readJsonFile<Ticket[]>(FILE_NAME, []);
}

function writeAll(tickets: Ticket[]): void {
  writeJsonFile(FILE_NAME, tickets);
}

export interface NewTicketInput {
  name: string;
  email: string;
  institution?: string;
  message: string;
}

/**
 * Cria uma nova solicitação de ajuda enviada pelo usuário público.
 * Importante: NÃO armazenamos nenhum identificador de conta de usuário,
 * sessão ou cookie de rastreamento aqui — apenas os dados que a própria
 * pessoa preencheu no formulário, o mínimo necessário para o admin poder
 * responder. Isso evita a necessidade de login do usuário e reduz a
 * superfície de dados pessoais tratados (princípio da minimização da LGPD).
 */
export function createTicket(input: NewTicketInput): Ticket {
  const tickets = readAll();

  const ticket: Ticket = {
    id: uuid(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    institution: input.institution?.trim() || undefined,
    message: input.message.trim(),
    status: 'pendente',
    createdAt: new Date().toISOString()
  };

  tickets.push(ticket);
  writeAll(tickets);
  return ticket;
}

export function listTickets(): Ticket[] {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getTicketById(id: string): Ticket | undefined {
  return readAll().find((t) => t.id === id);
}

export interface TicketStats {
  total: number;
  pendente: number;
  emAtendimento: number;
  finalizado: number;
}

export function getTicketStats(): TicketStats {
  const tickets = readAll();
  return {
    total: tickets.length,
    pendente: tickets.filter((t) => t.status === 'pendente').length,
    emAtendimento: tickets.filter((t) => t.status === 'em_atendimento').length,
    finalizado: tickets.filter((t) => t.status === 'finalizado').length
  };
}

/**
 * Marca um ticket como "em_atendimento" (o admin está cuidando do caso).
 */
export function markTicketInProgress(id: string): Ticket | null {
  const tickets = readAll();
  const ticket = tickets.find((t) => t.id === id);
  if (!ticket) return null;

  ticket.status = 'em_atendimento';
  writeAll(tickets);
  return ticket;
}

/**
 * Finaliza o atendimento: grava a resposta do admin e marca como
 * "finalizado". O envio do e-mail de resposta ao usuário é feito
 * separadamente pelo lib/mailer.ts, a partir da rota da API.
 */
export function finalizeTicket(id: string, adminReply: string): Ticket | null {
  const tickets = readAll();
  const ticket = tickets.find((t) => t.id === id);
  if (!ticket) return null;

  ticket.status = 'finalizado';
  ticket.adminReply = adminReply.trim();
  ticket.resolvedAt = new Date().toISOString();
  writeAll(tickets);
  return ticket;
}
