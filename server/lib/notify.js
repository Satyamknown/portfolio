import { notificationEmail, autoReplyEmail } from './emails.js';

// Best-effort email via Resend's REST API — no SDK needed, just fetch.
// If RESEND_API_KEY is unset (e.g. local dev without it configured), these
// quietly no-op so form submissions still save to the DB.

const FROM_FALLBACK = 'Portfolio <onboarding@resend.dev>';

async function send({ to, replyTo, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to) return { sent: false, reason: 'not configured' };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || FROM_FALLBACK,
      to,
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      html,
      text
    })
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend ${res.status}: ${body.slice(0, 300)}`);
  }
  return { sent: true };
}

/** Notifies Abhishek that someone wants his time. */
export function sendAppointmentEmail({ name, email, message }) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) return Promise.resolve({ sent: false, reason: 'not configured' });
  const { subject, html, text } = notificationEmail({ name, email, message });
  return send({ to, replyTo: email, subject, html, text });
}

/**
 * Confirms receipt to whoever filled the form. Needs a verified sending
 * domain in Resend — the shared onboarding@resend.dev address may only
 * deliver to the account owner, so this is allowed to fail on its own.
 */
export function sendAutoReply({ name, email }) {
  if (!email) return Promise.resolve({ sent: false, reason: 'no recipient' });
  const { subject, html, text } = autoReplyEmail({ name });
  return send({
    to: email,
    replyTo: process.env.NOTIFY_EMAIL || undefined,
    subject,
    html,
    text
  });
}
