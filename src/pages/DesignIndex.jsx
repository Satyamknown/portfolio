import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { designApi } from '../lib/designApi.js';
import Loading from '../components/Loading.jsx';
import Shot from '../components/design/Shot.jsx';
import useDesignHead from '../components/design/useDesignHead.js';
import DesignContact from '../components/design/DesignContact.jsx';
import '../design.css';

// Shown as a small strip under the project cards, not as a card of its own.
const AI_SLUG = 'ai-design-workflow';

export default function DesignIndex() {
  const [studies, setStudies] = useState([]);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useDesignHead('Design work · Abhishek Manjhi, Design Lead');

  useEffect(() => {
    designApi
      .list()
      .then(setStudies)
      .catch((e) => setError(e.message))
      .finally(() => setLoaded(true));
  }, []);

  const projects = studies.filter((s) => s.slug !== AI_SLUG);
  const aiStudy = studies.find((s) => s.slug === AI_SLUG);

  return (
    <div className="dz dz-index">
      <header className="dz-head dz-index-head">
        <div className="dz-in">
          <div className="dz-kicker">Design work · Design Lead, Rsquare Web Studio</div>
          <h1 className="dz-title">
            Abhishek Manjhi.
            <br />
            Product designer for complex B2B workflows.
          </h1>
          <div className="dz-intro">
            <p className="dz-tagline">
              I design web and B2B SaaS products where the hard part is the rules: who can do what, in what
              order, and what happens when something goes wrong.
            </p>
            <div>
              <p className="dz-summary">
                I start with the people and the roles, map the flows and the structure, then design the screens and
                stay with them until the live build matches. Nearly 5 years. Products for clients in India, Canada and the
                UK. Looking for a senior product designer role.
              </p>
              <p className="dz-tools">
                Tools I built:{' '}
                <a
                  href="https://www.figma.com/community/plugin/1633059296781307442/exportkit"
                  target="_blank"
                  rel="noreferrer"
                >
                  ExportKit
                </a>
                , a Figma plugin for batch asset export, and flowmap, a browser extension that captures a live
                product's flows into FigJam.
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="dz-cards-sec">
        <div className="dz-in">
          <div className="dz-cards-head">
            <span className="dz-kicker">Selected projects</span>
            <span className="dz-cards-note">
              Each one: the problem, my part, the decisions and the screens.
            </span>
          </div>

          {!loaded && <Loading />}
          {loaded && error && <p className="dz-empty">Couldn't load the projects. {error}</p>}
          {loaded && !error && projects.length === 0 && <p className="dz-empty">No design case studies yet.</p>}

          <div className="dz-cards">
            {projects.map((s, i) => (
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

          {aiStudy && (
            <aside className="dz-ai-strip" aria-labelledby="dz-ai-strip-title">
              <div className="dz-ai-strip-text">
                <span className="dz-kicker" id="dz-ai-strip-title">
                  How I use AI in design
                </span>
                <p>
                  On Stratalite, AI browser agents did the clicking: they mapped every screen of the live product, role
                  by role. I kept the design calls: how the boards read, what counted as a problem, and every action
                  that changed data.
                </p>
              </div>
              <ul className="dz-ai-strip-points">
                <li>
                  <b>5 flow boards,</b> one per role, laid out by the sidebar that role sees
                </li>
                <li>
                  <b>87 business questions</b> sent to the client, not fixes I had already picked
                </li>
                <li>
                  <b>flowmap,</b> a tool I built that turns captured screens into FigJam flow boards
                </li>
              </ul>
              <Link to={`/design/${AI_SLUG}`} className="dz-ai-strip-link">
                How I work with AI →
              </Link>
            </aside>
          )}
        </div>
      </section>

      <DesignContact />
    </div>
  );
}
