// Best-effort email via Resend's REST API — no SDK needed, just fetch.
// If RESEND_API_KEY is unset (e.g. local dev without it configured), this
// quietly no-ops so form submissions still save to the DB.
export async function sendAppointmentEmail({ name, email, message }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!apiKey || !to) return { sent: false, reason: 'not configured' };

  const escape = (s) =>
    String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const html = `
    <table style="font-family:sans-serif;font-size:14px">
      <tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td>${escape(name)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td>${escape(email)}</td></tr>
    </table>
    <p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap;margin-top:16px">${escape(message)}</p>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'Portfolio <onboarding@resend.dev>',
      to,
      reply_to: email,
      subject: `New appointment request from ${name}`,
      html
    })
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend ${res.status}: ${body.slice(0, 300)}`);
  }
  return { sent: true };
}
