import CONFIG from "@/config";
import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
  host: CONFIG.SMTP_HOST,
  port: Number(CONFIG.SMTP_PORT),
  secure: false,

  auth: {
    user: CONFIG.SMTP_USER,
    pass: CONFIG.SMTP_PASSWORD,
  },
});

/**
 * Envia um email utilizando o serviço de SMTP configurado.
 *
 *
 *
 * O assunto é automaticamente pós-fixado com o nome da aplicação.
 *
 * O conteúdo geralmente é gerado por templates.
 *
 * @example
 * ```ts
 * import { sendEmail } from "@/email";
 * import { verifyEmailTemplate } from "@/email/verifyEmail";
 *
 * await sendEmail(email, verifyEmailTemplate(url));
 * ```
 */
export async function sendEmail(
  to: string,
  email: {
    subject: string;
    html: string;
  },
) {
  await mailer.sendMail({
    from: CONFIG.SMTP_FROM,

    to: to,
    subject: `${email.subject} | Carreiros do Paraná`,
    html: email.html,
  });
}
