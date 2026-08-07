import { useState } from 'react';
import { api } from '../lib/api.js';
import { profile } from '../data/site.js';

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
      <div className="af-sent" role="status">
        Sent — thanks. I usually reply within a day.
      </div>
    );
  }

  return (
    <form className="af" onSubmit={submit}>
      {error && <div className="af-error">{error}</div>}

      <div className="af-pair">
        <label>
          Name
          <input required name="name" value={data.name} onChange={set('name')} />
        </label>
        <label>
          Email
          <input required type="email" name="email" value={data.email} onChange={set('email')} />
        </label>
      </div>

      <label>
        What&rsquo;s this about
        <textarea
          required
          name="message"
          rows={4}
          value={data.message}
          onChange={set('message')}
          placeholder="Role, company, what you'd like to talk through…"
        />
      </label>

      {/* Honeypot — hidden from real users, bots tend to fill every field */}
      <div className="hp-field" aria-hidden="true">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={data.website} onChange={set('website')} />
        </label>
      </div>

      <div className="af-actions">
        <button className="af-submit" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Request a time →'}
        </button>
        <a className="af-alt" href={`mailto:${profile.email}`}>
          or email directly
        </a>
      </div>
    </form>
  );
}
