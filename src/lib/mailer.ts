import nodemailer from 'nodemailer';

function buildTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_SECURE } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
    throw new Error(
      'Configuração de SMTP incompleta. Verifique SMTP_HOST, SMTP_PORT, SMTP_USER e SMTP_PASSWORD no .env.local'
    );
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD
    }
  });
}

/**
 * Notifica o admin (por e-mail) sempre que um usuário envia uma nova
 * solicitação de ajuda pelo site.
 */
export async function sendNewTicketNotification(params: {
  ticketId: string;
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!to) {
    console.warn('ADMIN_NOTIFICATION_EMAIL não configurado — notificação não enviada.');
    return;
  }

  const transporter = buildTransporter();
  const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/admin/dashboard`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Nova solicitação de ajuda — ${params.name}`,
    text:
      `Uma nova solicitação foi recebida no site Neurovian.\n\n` +
      `Nome: ${params.name}\n` +
      `E-mail do usuário: ${params.email}\n` +
      `Mensagem: ${params.message}\n\n` +
      `Acesse o painel para responder: ${dashboardUrl}`
  });
}

/**
 * Envia a resposta final do admin diretamente para o e-mail do usuário,
 * encerrando o atendimento. Esta é a forma de retorno ao usuário
 * combinada no projeto (o usuário não tem login no site).
 */
export async function sendTicketResolutionEmail(params: {
  toName: string;
  toEmail: string;
  reply: string;
}): Promise<void> {
  const transporter = buildTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: params.toEmail,
    subject: 'Retorno da equipe Neurovian sobre sua solicitação',
    text:
      `Olá, ${params.toName}!\n\n` +
      `${params.reply}\n\n` +
      `Atenciosamente,\nEquipe Neurovian`
  });
}
