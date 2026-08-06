import { Link } from 'react-router-dom';
import { microcopy } from '../data/site.js';

export default function NotFound() {
  return (
    <section className="first">
      <div className="eyebrow">404</div>
      <h1 className="about-title">Not found</h1>
      <p className="contact-body">{microcopy.notFound}</p>
      <div className="hero-actions">
        <Link to="/" className="btn btn-primary">
          Back to the start
        </Link>
        <Link to="/work" className="btn btn-ghost">
          View case studies
        </Link>
      </div>
    </section>
  );
}
