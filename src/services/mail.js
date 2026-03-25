import nodemailer from "nodemailer";

/**
 * Send an email using SMTP credentials from environment variables.
 * If SMTP_HOST is not configured, the call is silently skipped.
 *
 * Required env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 * Optional: SMTP_FROM (defaults to SMTP_USER)
 */
export async function sendMail({ to, subject, html }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("SMTP not configured – skipping email");
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject,
    html,
  });
}
