import { NextRequest, NextResponse } from 'next/server';
import {
  finalizeTicket,
  getTicketById,
  markTicketInProgress
} from '@/lib/ticketRepository';
import { finalizeTicketSchema } from '@/lib/validation';
import { sendTicketResolutionEmail } from '@/lib/mailer';

interface RouteParams {
  params: { id: string };
}

/**
 * PATCH: usado pelo painel admin para duas ações:
 *  - { action: "iniciar" }            -> marca como "em_atendimento"
 *  - { action: "finalizar", reply }   -> finaliza e envia e-mail ao usuário
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const ticket = getTicketById(params.id);
  if (!ticket) {
    return NextResponse.json({ error: 'Solicitação não encontrada.' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);

  if (body?.action === 'iniciar') {
    const updated = markTicketInProgress(params.id);
    return NextResponse.json({ ok: true, ticket: updated });
  }

  if (body?.action === 'finalizar') {
    const parsed = finalizeTicketSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' },
        { status: 400 }
      );
    }

    const updated = finalizeTicket(params.id, parsed.data.reply);

    try {
      await sendTicketResolutionEmail({
        toName: ticket.name,
        toEmail: ticket.email,
        reply: parsed.data.reply
      });
    } catch (error) {
      console.error('Falha ao enviar e-mail de resposta ao usuário:', error);
      return NextResponse.json(
        {
          ok: true,
          ticket: updated,
          warning: 'Atendimento finalizado, mas o e-mail de resposta falhou ao enviar.'
        },
        { status: 207 }
      );
    }

    return NextResponse.json({ ok: true, ticket: updated });
  }

  return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const ticket = getTicketById(params.id);
  if (!ticket) {
    return NextResponse.json({ error: 'Solicitação não encontrada.' }, { status: 404 });
  }
  return NextResponse.json({ ticket });
}
