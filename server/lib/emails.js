// HTML email templates. Email clients are a decade behind browsers, so:
// tables for layout, inline styles only, no flex/grid, font stacks not webfonts,
// and the cat is ASCII because Gmail strips SVG and blocks data: URIs in <img>.

const PAPER = '#f4f2ed';
const INK = '#171512';
const SOFT = '#514d44';
const FAINT = '#6f6a60';
const LINE = '#dcd8cf';
const GREEN = '#35c24a';
const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const SANS = "'Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Preserves paragraph breaks without letting raw HTML through.
function paragraphs(text) {
  return esc(text)
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function shell(inner, preheader) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>@media (max-width:620px){.pad{padding:28px 22px!important}.h1{font-size:30px!important}}</style>
</head>
<body style="margin:0;padding:0;background:${PAPER};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${PAPER};border:1px solid ${LINE};">
${inner}
</table>
</td></tr></table>
</body></html>`;
}

function footer() {
  return `<tr><td class="pad" style="padding:20px 36px 26px;border-top:1px solid ${LINE};font-family:${MONO};font-size:11px;color:${FAINT};">
  abhishek manjhi &nbsp;·&nbsp; mumbai, in &nbsp;·&nbsp; design lead → product manager
</td></tr>`;
}

/* ------------------------------------------------------------------ *
 * 1. Notification — the one Abhishek receives. Regal announcement.
 * ------------------------------------------------------------------ */
export function notificationEmail({ name, email, message }) {
  const when = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  });

  const inner = `
<tr><td class="pad" style="padding:40px 36px 0;text-align:center;">
  <div style="font-size:30px;line-height:1;color:${GREEN};">&#9812;</div>
  <div style="margin-top:12px;font-family:${MONO};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${FAINT};">
    By appointment &nbsp;—&nbsp; ${esc(when)} IST
  </div>
</td></tr>

<tr><td class="pad" style="padding:22px 36px 0;text-align:center;">
  <div style="border-top:1px solid ${INK};border-bottom:1px solid ${INK};padding:20px 0;">
    <h1 class="h1" style="margin:0;font-family:${SANS};font-size:38px;line-height:1.05;letter-spacing:-0.03em;font-weight:700;color:${INK};">
      Someone wants<br>your time.
    </h1>
  </div>
</td></tr>

<tr><td class="pad" style="padding:26px 36px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${MONO};font-size:13px;">
    <tr>
      <td width="88" style="padding:9px 0;color:${FAINT};border-bottom:1px solid ${LINE};">Name</td>
      <td style="padding:9px 0;color:${INK};border-bottom:1px solid ${LINE};">${esc(name)}</td>
    </tr>
    <tr>
      <td width="88" style="padding:9px 0;color:${FAINT};border-bottom:1px solid ${LINE};">Email</td>
      <td style="padding:9px 0;border-bottom:1px solid ${LINE};">
        <a href="mailto:${esc(email)}" style="color:${INK};text-decoration:underline;">${esc(email)}</a>
      </td>
    </tr>
  </table>
</td></tr>

<tr><td class="pad" style="padding:24px 36px 0;">
  <div style="font-family:${MONO};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${FAINT};margin-bottom:12px;">
    The message
  </div>
  <div style="border-left:2px solid ${GREEN};padding:2px 0 2px 18px;font-family:${SANS};font-size:16px;line-height:1.6;color:${SOFT};font-weight:300;">
    ${paragraphs(message)}
  </div>
</td></tr>

<tr><td class="pad" style="padding:30px 36px 36px;">
  <a href="mailto:${esc(email)}?subject=${encodeURIComponent('Re: your note')}"
     style="display:inline-block;background:${INK};color:${PAPER};font-family:${MONO};font-size:13px;padding:14px 28px;border-radius:999px;text-decoration:none;">
    Reply to ${esc((name || '').split(' ')[0] || 'them')} &rarr;
  </a>
  <div style="margin-top:14px;font-family:${MONO};font-size:11px;color:${FAINT};">
    Hitting reply works too — it goes straight to them.
  </div>
</td></tr>
${footer()}`;

  return {
    subject: `♔ ${name} requests an audience`,
    html: shell(inner, `${name} — ${String(message).slice(0, 90)}`),
    text: `NEW APPOINTMENT REQUEST — ${when} IST\n\nName:  ${name}\nEmail: ${email}\n\n${message}\n\nReply directly to this email to reach them.`
  };
}

/* ------------------------------------------------------------------ *
 * 2. Auto-reply — premium confirmation to the person who submitted.
 *    Styled as an extension of the portfolio, not a mailchimp blast.
 * ------------------------------------------------------------------ */

const PHONE_DISPLAY = '+91 88284 47664';
const PHONE_TEL     = '+918828447664';

export function autoReplyEmail({ name, email, message }) {
  const first = esc((name || '').trim().split(/\s+/)[0] || 'there');

  // Message card rows — only render rows with values
  const msgRows = [
    { label: 'Name',    value: name },
    { label: 'Email',   value: email },
    { label: 'Message', value: message }
  ].filter(r => r.value?.trim()).map(({ label, value }) => {
    const isMessage = label === 'Message';
    return `
    <tr>
      <td width="80" valign="top" style="padding:10px 14px 10px 0;font-family:${MONO};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${FAINT};white-space:nowrap;border-bottom:1px solid ${LINE};">${esc(label)}</td>
      <td valign="top" style="padding:10px 0;font-family:${isMessage ? SANS : MONO};font-size:${isMessage ? '15px' : '13px'};color:${INK};line-height:${isMessage ? '1.6' : '1.4'};border-bottom:1px solid ${LINE};">${isMessage ? paragraphs(value) : esc(value)}</td>
    </tr>`;
  }).join('');

  const inner = `

<!-- ── HERO ─────────────────────────────────────────────── -->
<tr><td class="pad" style="padding:50px 36px 0;">
  <div style="font-family:${MONO};font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${GREEN};margin-bottom:18px;">
    &#10003;&nbsp;&nbsp;Received
  </div>
  <div style="border-top:2px solid ${INK};border-bottom:1px solid ${LINE};padding:22px 0 24px;">
    <h1 class="h1" style="margin:0;font-family:${SANS};font-size:42px;line-height:1.0;letter-spacing:-0.035em;font-weight:700;color:${INK};">
      Thank you for<br>reaching out.
    </h1>
  </div>
</td></tr>

<!-- ── BODY COPY ──────────────────────────────────────────── -->
<tr><td class="pad" style="padding:28px 36px 0;">
  <p style="margin:0;font-family:${SANS};font-size:18px;line-height:1.65;color:${INK};font-weight:400;">
    Hi ${first},
  </p>
  <p style="margin:14px 0 0;font-family:${SANS};font-size:16px;line-height:1.7;color:${SOFT};font-weight:300;">
    Thank you for taking the time to get in touch. I&rsquo;ve received your
    message and really appreciate you reaching out.
  </p>
  <p style="margin:14px 0 0;font-family:${SANS};font-size:16px;line-height:1.7;color:${SOFT};font-weight:300;">
    I&rsquo;ll go through the details you&rsquo;ve shared and get back to you
    as soon as I can. I&rsquo;m looking forward to learning more and seeing
    how we can work together.
  </p>
</td></tr>

<!-- ── MESSAGE RECAP ─────────────────────────────────────── -->
<tr><td class="pad" style="padding:34px 36px 0;">
  <div style="font-family:${MONO};font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${FAINT};margin-bottom:14px;">
    Your message
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background:#efece5;border:1px solid ${LINE};padding:4px 20px;">
    <tbody>${msgRows}</tbody>
  </table>
</td></tr>

<!-- ── PHONE CTA ──────────────────────────────────────────── -->
<tr><td class="pad" style="padding:34px 36px 0;">
  <div style="border:1px solid ${LINE};padding:28px 28px 26px;">
    <div style="font-family:${MONO};font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${FAINT};margin-bottom:14px;">
      Need to reach me sooner?
    </div>
    <p style="margin:0 0 18px;font-family:${SANS};font-size:15px;line-height:1.65;color:${SOFT};font-weight:300;">
      If your request is time-sensitive or you&rsquo;d simply prefer to speak
      directly, feel free to give me a call.
    </p>
    <a href="tel:${PHONE_TEL}"
       style="display:inline-block;background:${INK};color:${PAPER};font-family:${MONO};font-size:14px;letter-spacing:0.04em;padding:14px 28px;border-radius:999px;text-decoration:none;">
      &#128222;&nbsp;&nbsp;${PHONE_DISPLAY}
    </a>
    <p style="margin:16px 0 0;font-family:${MONO};font-size:11px;color:${FAINT};">
      I&rsquo;ll do my best to pick up or call back promptly.
    </p>
  </div>
</td></tr>

<!-- ── SIGN-OFF ───────────────────────────────────────────── -->
<tr><td class="pad" style="padding:32px 36px 44px;">
  <p style="margin:0 0 4px;font-family:${SANS};font-size:15px;line-height:1.6;color:${SOFT};font-weight:300;">
    Thanks again for reaching out.
  </p>
  <p style="margin:18px 0 0;font-family:${SANS};font-size:15px;color:${INK};font-weight:600;">
    Best,<br>Abhishek
  </p>
  <p style="margin:6px 0 0;font-family:${MONO};font-size:11px;color:${FAINT};line-height:1.6;">
    Designer &amp; Developer<br>
    <a href="tel:${PHONE_TEL}" style="color:${FAINT};text-decoration:none;">${PHONE_DISPLAY}</a>
  </p>
  <div style="margin-top:28px;border-top:1px solid ${LINE};padding-top:16px;font-family:${MONO};font-size:10px;color:${FAINT};">
    This is an automated confirmation &mdash; no reply needed. Abhishek will be in touch soon.
  </div>
</td></tr>
${footer()}`;

  const textPhone = PHONE_DISPLAY;
  return {
    subject: `Thank you for reaching out, ${(name || '').trim().split(/\s+/)[0] || first} — I\u2019ll be in touch soon`,
    html: shell(inner, `Got your message, ${(name||'').trim().split(/\s+/)[0]||'there'}. Abhishek will get back to you soon.`),
    text: [
      `Hi ${(name || '').trim().split(/\s+/)[0] || 'there'},`,
      '',
      `Thank you for taking the time to get in touch. I've received your message and really appreciate you reaching out.`,
      '',
      `I'll go through the details you've shared and get back to you as soon as I can.`,
      '',
      '--- Your Message ---',
      name    ? `Name:    ${name}`    : '',
      email   ? `Email:   ${email}`   : '',
      message ? `Message: ${message}` : '',
      '',
      'Need to reach me sooner?',
      `Call me directly: ${textPhone}`,
      '',
      'Thanks again,',
      'Abhishek',
      `Designer & Developer · ${textPhone}`,
      '',
      '(This is an automated confirmation — no reply needed.)'
    ].filter(l => l !== null).join('\n')
  };
}
