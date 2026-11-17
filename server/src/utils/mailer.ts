import nodemailer from 'nodemailer';

export interface SendReplyOptions {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

export interface SendReplyResult {
  sent: boolean;
  messageId?: string;
  reason?: string;
}

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      !process.env.SMTP_PASS.includes('your_16_char')
  );
}

export async function sendReplyEmail({
  to,
  subject,
  text,
  replyTo,
}: SendReplyOptions): Promise<SendReplyResult> {
  if (!isSmtpConfigured()) {
    return { sent: false, reason: 'SMTP_NOT_CONFIGURED' };
  }

  const port = Number(process.env.SMTP_PORT) || 465;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"Praveen Bankhede" <${process.env.SMTP_USER}>`,
    to,
    replyTo: replyTo || process.env.SMTP_USER,
    subject,
    text,
  });

  return { sent: true, messageId: info.messageId };
}
