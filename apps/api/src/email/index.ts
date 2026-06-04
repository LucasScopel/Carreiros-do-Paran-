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
