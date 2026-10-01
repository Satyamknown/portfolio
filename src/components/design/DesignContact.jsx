import AppointmentForm from '../AppointmentForm.jsx';
import { home } from '../../data/site.js';

/**
 * The cat contact form from Home, framed for the /design pages: same section
 * shape (label, hand-lettered greeting, heading, short line), laid out on the
 * .dz grid. Submit behaviour lives in AppointmentForm and is unchanged.
 */
export default function DesignContact() {
  return (
    <section id="contact" className="dz-contact" data-cursor="paw" aria-labelledby="dz-contact-title">
      <div className="dz-in dz-contact-grid">
        <div className="dz-sec-label">
          <span>Contact</span>
        </div>
        <div className="dz-contact-text">
          <div className="contact-hand" aria-hidden="true">
            {home.contactHand}
          </div>
          <h3 className="contact-title" id="dz-contact-title">
            Have a product that needs a designer?
          </h3>
          <p className="contact-para">
            Tell me about the role or the problem: a messy flow, a design system, a product nobody has mapped yet. I
            usually reply within a day.
          </p>
        </div>
        <div className="dz-contact-form">
          <AppointmentForm />
        </div>
      </div>
    </section>
  );
}
