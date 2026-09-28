import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api.js';
import './Access.css';

export default function Access({ onUnlock }) {
  const { search } = useLocation();
  const linkExpired = new URLSearchParams(search).get('link') === 'expired';
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await api.unlockAccess(password);
      onUnlock();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="access-shell">
      <section className="access-card" aria-labelledby="access-title">
        <div className="access-kicker">Private portfolio</div>
        <h1 id="access-title">Enter the access password</h1>
        <p>Use the access password given by Abhishek to continue.</p>

        {linkExpired && (
          <p className="access-notice" role="status">
            This link is no longer active. Ask Abhishek for a new one, or enter the password.
          </p>
        )}

        <form className="access-form" onSubmit={submit}>
          <label htmlFor="site-password">Password</label>
          <div className="access-input-row">
            <input
              id="site-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              required
            />
            <button type="submit" disabled={busy}>
              {busy ? 'Checking...' : 'Enter'}
            </button>
          </div>
          {error && <div className="access-error">{error}</div>}
        </form>
      </section>
    </main>
  );
}
