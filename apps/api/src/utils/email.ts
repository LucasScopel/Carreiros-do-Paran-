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

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  await mailer.sendMail({
    from: CONFIG.SMTP_FROM,

    ...options,
  });
}
