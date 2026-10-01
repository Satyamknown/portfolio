import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { designApi } from '../lib/designApi.js';
import Loading from '../components/Loading.jsx';
import Shot from '../components/design/Shot.jsx';
import '../design.css';

export default function DesignIndex() {
  const [studies, setStudies] = useState([]);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Restore the site title on the way out: no other page sets one.
    const previous = document.title;
    document.title = 'Design work · Abhishek Manjhi';
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    designApi
      .list()
      .then(setStudies)
      .catch((e) => setError(e.message))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <div className="dz dz-index">
      <header className="dz-head dz-index-head">
        <div className="dz-in">
          <div className="dz-kicker">Design work</div>
          <h1 className="dz-title">
            Abhishek Manjhi.
            <br />
            Design Lead.
          </h1>
          <div className="dz-intro">
            <p className="dz-tagline">
              I design web and B2B SaaS products where the hard part is the rules: who can do what, in what
              order, and what happens when something goes wrong.
            </p>
            <p className="dz-summary">
              I start with the people and the roles, map the flows and the structure, then design the screens and
              stay with them until the live build matches. 4+ years. Products for clients in India, Canada and the
              UK. Looking for a senior product designer role.
            </p>
          </div>
        </div>
      </header>

      <section className="dz-cards-sec">
        <div className="dz-in">
          <div className="dz-cards-head">
            <span className="dz-kicker">Selected projects</span>
            <span className="dz-cards-note">
              Each one with the result first, then the problem, my part, the decisions and the screens.
            </span>
          </div>

          {!loaded && <Loading />}
          {loaded && error && <p className="dz-empty">Couldn't load the projects. {error}</p>}
          {loaded && !error && studies.length === 0 && <p className="dz-empty">No design case studies yet.</p>}

          <div className="dz-cards">
            {studies.map((s, i) => (
              <Link key={s.slug} to={`/design/${s.slug}`} className={`dz-card ${i === 0 ? 'is-lead' : ''}`}>
                <Shot image={{ src: s.heroImage, alt: s.heroAlt || s.title }} eager={i < 2} className="dz-card-shot" />
                <div className="dz-card-body">
                  <div className="dz-card-top">
                    <span className="dz-card-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="dz-card-client">{s.client}</span>
                  </div>
                  <h2 className="dz-card-title">{s.title}</h2>
                  {s.tagline && <p className="dz-card-tag">{s.tagline}</p>}
                  {s.impact?.length > 0 && (
                    <ul className="dz-card-impact">
                      {s.impact.slice(0, 3).map((m, k) => (
                        <li key={k}>
                          <span className="dz-card-value">{m.value}</span>
                          <span className="dz-card-label">{m.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <span className="dz-card-cta">Read the case study →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
