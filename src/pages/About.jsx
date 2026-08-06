import { Link } from 'react-router-dom';
import Inline from '../components/Inline.jsx';
import { profile, bio, objection, requirements } from '../data/site.js';

export default function About() {
  return (
    <>
      <section className="first">
        <div className="eyebrow">About</div>
        <h1 className="about-title">{profile.name}</h1>

        <div className="about-body">
          {bio.long.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

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
      </section>

      <section>
        <div className="section-label">
          <span className="section-num">01</span>
          Why a designer, for a PM seat
        </div>
        <div className="objection">
          {objection.map((para, i) => (
            <p key={i}>
              <Inline>{para}</Inline>
            </p>
          ))}
        </div>
      </section>

      <section>
        <div className="section-label">
          <span className="section-num">02</span>
          Requirements met
        </div>
        <div className="req-grid">
          {requirements.map((r) => (
            <article className="req-card" key={r.competency}>
              <div className="req-competency">{r.competency}</div>
              <h3 className="req-claim">{r.claim}</h3>
              <p className="req-evidence">{r.evidence}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="hero-actions">
          <Link to="/work" className="btn btn-primary">
            View case studies →
          </Link>
          <Link to="/contact" className="btn btn-ghost">
            Get in touch
          </Link>
        </div>
      </section>
    </>
  );
}
