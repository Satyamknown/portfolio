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
 * 2. Auto-reply — what the sender gets back. Cat on watch duty.
 * ------------------------------------------------------------------ */
const CAT = `    /\\_/\\
   ( -.- )  ~ z Z
    > ^ <
   (")_(")`;

export function autoReplyEmail({ name }) {
  const first = esc((name || '').trim().split(/\s+/)[0] || 'there');

  const inner = `
<tr><td class="pad" style="padding:40px 36px 0;text-align:center;">
  <div style="font-family:${MONO};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${FAINT};">
    Message received
  </div>
</td></tr>

<tr><td class="pad" style="padding:24px 36px 0;text-align:center;">
  <h1 class="h1" style="margin:0;font-family:${SANS};font-size:34px;line-height:1.1;letter-spacing:-0.03em;font-weight:700;color:${INK};">
    Got it, ${first}.
  </h1>
</td></tr>

<tr><td class="pad" style="padding:28px 36px 0;text-align:center;">
  <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="border:1px solid ${LINE};background:#efece5;">
    <tr><td style="padding:24px 34px;">
      <pre style="margin:0;font-family:${MONO};font-size:13px;line-height:1.35;color:${INK};white-space:pre;">${CAT}</pre>
      <div style="margin-top:16px;font-family:${MONO};font-size:12px;color:${GREEN};">
        &#9733; guard cat on duty &#9733;
      </div>
    </td></tr>
  </table>
</td></tr>

<tr><td class="pad" style="padding:26px 36px 0;text-align:center;">
  <p style="margin:0;font-family:${SANS};font-size:17px;line-height:1.6;color:${SOFT};font-weight:300;">
    &ldquo;Please wait right here. My bro will get back to you.&rdquo;
  </p>
  <p style="margin:16px 0 0;font-family:${SANS};font-size:15px;line-height:1.6;color:${FAINT};font-weight:300;">
    Your note landed safely. Abhishek reads every one himself and usually
    replies within a day — sooner if the cat naps less.
  </p>
</td></tr>

<tr><td class="pad" style="padding:28px 36px 36px;text-align:center;">
  <div style="border-top:1px solid ${LINE};padding-top:22px;font-family:${MONO};font-size:11px;color:${FAINT};">
    No reply needed — this one&rsquo;s automatic.
  </div>
</td></tr>
${footer()}`;

  return {
    subject: 'Got it — the cat is on it 🐾',
    html: shell(inner, 'Your message landed. Abhishek usually replies within a day.'),
    text: `Got it, ${first}.\n\n${CAT}\n\n"Please wait right here. My bro will get back to you."\n\nYour note landed safely. Abhishek reads every one himself and usually replies within a day.\n\nNo reply needed — this one's automatic.`
  };
}
