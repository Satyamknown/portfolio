import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { designApi } from '../lib/designApi.js';
import Loading from '../components/Loading.jsx';
import Shot from '../components/design/Shot.jsx';
import ImpactStrip from '../components/design/ImpactStrip.jsx';
import Section from '../components/design/Section.jsx';
import useDesignHead from '../components/design/useDesignHead.js';
import '../design.css';

export default function DesignDetail() {
  const { slug } = useParams();
  const [study, setStudy] = useState(null);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useDesignHead(study ? `${study.title} · Design · Abhishek Manjhi` : 'Design work · Abhishek Manjhi, Design Lead');

  useEffect(() => {
    setLoaded(false);
    setError(null);
    designApi
      .get(slug)
      .then((s) => {
        setStudy(s);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoaded(true));
    window.scrollTo(0, 0);
  }, [slug]);

  if (!loaded) return <Loading />;

  if (error || !study) {
    return (
      <section className="first">
        <div className="empty">
          <h3>Case study not found</h3>
          <p>{error || "This one doesn't exist or isn't published."}</p>
          <Link to="/design" className="btn btn-ghost btn-sm">
            ← All design work
          </Link>
        </div>
      </section>
    );
  }

  const meta = [
    ['Role', study.role],
    ['Client', study.client],
    ['Timeline', study.timeline],
    ['Team', study.team],
    ['Tools', study.tools?.join(', ')]
  ].filter(([, v]) => v);

  return (
    <article className="dz dz-detail">
      <header className="dz-head">
        <div className="dz-in">
          <Link to="/design" className="dz-back">
            ← Design work
          </Link>
          <div className="dz-kicker">Case study</div>
          <h1 className="dz-title">{study.title}</h1>
          {study.tagline && <p className="dz-tagline">{study.tagline}</p>}
          {study.summary && <p className="dz-summary">{study.summary}</p>}
        </div>
      </header>

      <div className="dz-hero">
        <div className="dz-in">
          <Shot
            image={{ src: study.heroImage, alt: study.heroAlt || study.title }}
            eager
            zoomable
            className="dz-hero-shot"
          />
        </div>
      </div>

      <div className="dz-meta">
        <div className="dz-in">
          <dl className="dz-meta-grid">
            {meta.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <ImpactStrip items={study.impact} />

      {study.sections?.map((s, i) => (
        <Section key={i} section={s} index={i} />
      ))}

      {study.next && (
        <Link to={`/design/${study.next.slug}`} className="dz-next">
          <div className="dz-in dz-next-in">
            <div className="dz-next-text">
              <span className="dz-kicker">Next project</span>
              <span className="dz-next-title">{study.next.title}</span>
              {study.next.tagline && <span className="dz-next-tag">{study.next.tagline}</span>}
            </div>
            {study.next.heroImage && (
              <img className="dz-next-img" src={study.next.heroImage} alt="" loading="lazy" />
            )}
          </div>
        </Link>
      )}
    </article>
  );
}
