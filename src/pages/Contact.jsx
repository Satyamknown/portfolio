import { profile, contact } from '../data/site.js';

export default function Contact() {
  return (
    <section className="first">
      <div className="eyebrow">Contact</div>
      <h1 className="about-title">{contact.heading}</h1>

      <p className="contact-body">{contact.body}</p>

      <dl className="contact-fields">
        <div>
          <dt>Based in</dt>
          <dd>{profile.location}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{profile.role}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <span className="status-tag">{profile.status}</span>
          </dd>
        </div>
      </dl>

      <div className="hero-actions">
        <a className="btn btn-primary" href={`mailto:${profile.email}`}>
          Email me
        </a>
        <a className="btn btn-ghost" href={profile.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a className="btn btn-ghost" href={profile.resume}>
          Resume (PDF)
        </a>
      </div>
    </section>
  );
}
