import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';

// Passwordless admin sign-in: type the admin email, get a one-time link, click it.
export default function Login() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const linkToken = params.get('token');
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(Boolean(linkToken));
  const verified = useRef(false);

  // Arriving from the email: trade the one-time token for a session, then drop it from the URL.
  useEffect(() => {
    if (!linkToken || verified.current) return;
    verified.current = true;
    api
      .verifyLoginLink(linkToken)
      .then(() => navigate('/admin', { replace: true }))
      .catch((err) => {
        setError(err.message);
        setVerifying(false);
        setParams({}, { replace: true });
      });
  }, [linkToken, navigate, setParams]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.requestLoginLink(email);
      setSentTo(email.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (verifying) {
    return (
      <section className="first">
        <div className="eyebrow">Admin</div>
        <h2>Signing you in…</h2>
      </section>
    );
  }

  return (
    <section className="first">
      <div className="eyebrow">Admin</div>
      <h2>Sign in</h2>

      {error && <div className="notice notice-error">{error}</div>}

      {sentTo ? (
        <div className="panel" style={{ marginTop: 24, maxWidth: 420 }}>
          <p style={{ margin: 0 }}>
            If <b>{sentTo}</b> is the admin email, a sign-in link is on its way. It works once and expires in 15
            minutes.
          </p>
          <p className="field-hint" style={{ marginTop: 12 }}>
            Nothing after a minute? Check spam, then{' '}
            <button type="button" className="link-button" onClick={() => setSentTo(null)}>
              try again
            </button>
            .
          </p>
        </div>
      ) : (
        <form className="panel" onSubmit={submit} style={{ marginTop: 24, maxWidth: 380 }}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Sending…' : 'Email me a sign-in link'}
          </button>
        </form>
      )}
    </section>
  );
}
