import { NextRequest, NextResponse } from 'next/server';
import { createTicket, getTicketStats, listTickets } from '@/lib/ticketRepository';
import { newTicketSchema } from '@/lib/validation';
import { sendNewTicketNotification } from '@/lib/mailer';

/**
 * POST público: qualquer visitante do site pode enviar uma solicitação
 * de ajuda SEM precisar criar conta ou fazer login — exatamente como
 * pedido, para não caracterizar tratamento de dados de cadastro/conta
 * sob a LGPD além do estritamente necessário para o atendimento.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = newTicketSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' },
      { status: 400 }
    );
  }

  const ticket = createTicket(parsed.data);

  // Falha ao enviar e-mail não deve impedir o registro da solicitação.
  try {
    await sendNewTicketNotification({
      ticketId: ticket.id,
      name: ticket.name,
      email: ticket.email,
      message: ticket.message
    });
  } catch (error) {
    console.error('Falha ao notificar admin por e-mail:', error);
  }

  return NextResponse.json({ ok: true, id: ticket.id }, { status: 201 });
}

/**
 * GET protegido pelo middleware: somente o admin autenticado pode listar
 * as solicitações e ver as estatísticas usadas no dashboard.
 */
export async function GET() {
  const tickets = listTickets();
  const stats = getTicketStats();
  return NextResponse.json({ tickets, stats });
}
