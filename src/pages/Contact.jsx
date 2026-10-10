import { useEffect, useState } from 'react';
import feedback from '../lib/feedback.js';
import { setCursorState } from '../lib/cursor.js';
import { contact, emailCompose, profile } from '../data/site.js';
import AppointmentForm from '../components/AppointmentForm.jsx';
import { ArrowUpRight, Download } from '../components/Icons.jsx';

export default function Contact() {
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    setPrompt('Meow! Tap the Call button if you want my attention — I am ready to chat.');
  }, []);

  return (
    <section className="first contact-page" data-cursor="paw">
      <div className="eyebrow">Contact</div>
      <h1 className="about-title">{contact.heading}</h1>

      <p className="contact-body">{contact.body}</p>

      <div className="hero-actions contact-actions">
        <a
          className="btn btn-primary"
          href="tel:+918828447664"
          onPointerDown={() => {
            feedback.tap();
            setCursorState('paw-closed');
          }}
        >
          Call me
        </a>
        {/* mailto: does nothing on machines without a mail app set up, so the
            button opens a ready-to-send Gmail draft in a new tab instead. */}
        <a className="btn btn-ghost" href={emailCompose} target="_blank" rel="noreferrer">
          Email me <ArrowUpRight />
        </a>
        <a className="btn btn-ghost" href={profile.linkedin} target="_blank" rel="noreferrer">
          LinkedIn <ArrowUpRight />
        </a>
        <a className="btn btn-ghost" href={profile.resume} download="Abhishek-Manjhi-Resume.pdf">
          Resume <Download />
        </a>
      </div>

      <AppointmentForm prompt={prompt} />
    </section>
  );
}
