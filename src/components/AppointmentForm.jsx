import { useRef, useState } from 'react';
import { api } from '../lib/api.js';
import feedback from '../lib/feedback.js';
import { profile } from '../data/site.js';
import ContactCat from './ContactCat.jsx';

const EMPTY = { name: '', email: '', message: '', website: '' };

export default function AppointmentForm({ prompt }) {
  const [data, setData] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState(null);
  // The success copy waits for the cat to land and sit before it appears.
  const [settled, setSettled] = useState(false);

  const cat = useRef(null);
  const nudged = useRef(false);

  const set = (key) => (e) => setData((d) => ({ ...d, [key]: e.target.value }));

  // Only nudge on the first field focus — repeating it every tab would nag.
  function handleFocus() {
    if (nudged.current || status !== 'idle') return;
    nudged.current = true;
    cat.current?.focus();
  }

  async function submit(e) {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    try {
      await api.submitAppointment(data);
      setStatus('sent');
      setData(EMPTY);
      feedback.success();
      cat.current?.submitSuccess(); // the real jump, only after a genuine success
    } catch (err) {
      setStatus('error');
      setError(err.message);
      feedback.error();
      cat.current?.submitError();
    }
  }

  const sent = status === 'sent';

  return (
    <div className="cat-form">
      <ContactCat ref={cat} prompt={prompt} onSettled={() => setSettled(true)} />

      {sent ? (
        // Reserved in place so nothing shifts while the cat is mid-jump.
        <div className={`af-sent-wrap ${settled ? 'is-in' : ''}`} role="status" aria-live="polite">
          <p className="af-sent-title">Thank you for the response. I&rsquo;ll get back to you.</p>
          <p className="af-sent-note">
            If it&rsquo;s urgent, call me at{' '}
            <a href="tel:+918828447664">8828447664</a>.
          </p>
        </div>
      ) : (
        <form className="af" onSubmit={submit}>
          {error && <div className="af-error">{error}</div>}

          <div className="af-pair">
            <label>
              Name
              <input
                required
                name="name"
                value={data.name}
                onChange={set('name')}
                onFocus={handleFocus}
              />
            </label>
            <label>
              Email
              <input
                required
                type="email"
                name="email"
                value={data.email}
                onChange={set('email')}
                onFocus={handleFocus}
              />
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
              onFocus={handleFocus}
              placeholder="Role, company, what you'd like to talk through…"
            />
          </label>

          {/* Honeypot — hidden from real users, bots tend to fill every field */}
          <div className="hp-field" aria-hidden="true">
            <label>
              Website
              <input
                tabIndex={-1}
                autoComplete="off"
                value={data.website}
                onChange={set('website')}
              />
            </label>
          </div>

          <div className="af-actions">
            <button
              className="af-submit"
              type="submit"
              disabled={status === 'sending'}
              onPointerDown={() => feedback.tap()}
            >
              {status === 'sending' ? 'Sending…' : 'Request a time →'}
            </button>
            <a className="af-alt" href={`mailto:${profile.email}`} onPointerDown={() => feedback.tap()}>
              or email directly
            </a>
          </div>
        </form>
      )}
    </div>
  );
}
