import { useState } from 'react';
import { api } from '../lib/api.js';

const EMPTY = { name: '', email: '', message: '', website: '' };

export default function AppointmentForm() {
  const [data, setData] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState(null);

  const set = (key) => (e) => setData((d) => ({ ...d, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    try {
      await api.submitAppointment(data);
      setStatus('sent');
      setData(EMPTY);
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  }

  if (status === 'sent') {
    return (
      <div className="notice notice-ok" role="status">
        Sent — thanks. I usually reply within a day.
      </div>
    );
  }

  return (
    <form className="panel appointment-form" onSubmit={submit}>
      {error && <div className="notice notice-error">{error}</div>}

      <div className="field-row">
        <div className="field">
          <label htmlFor="apt-name">Name</label>
          <input id="apt-name" value={data.name} onChange={set('name')} required />
        </div>
        <div className="field">
          <label htmlFor="apt-email">Email</label>
          <input id="apt-email" type="email" value={data.email} onChange={set('email')} required />
        </div>
      </div>

      <div className="field">
        <label htmlFor="apt-message">What's this about</label>
        <textarea
          id="apt-message"
          rows={4}
          value={data.message}
          onChange={set('message')}
          placeholder="Role, company, what you'd like to talk through…"
          required
        />
      </div>

      {/* Honeypot — hidden from real users, bots tend to fill every field */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="apt-website">Website</label>
        <input id="apt-website" tabIndex={-1} autoComplete="off" value={data.website} onChange={set('website')} />
      </div>

      <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Request a time'}
      </button>
    </form>
  );
}
