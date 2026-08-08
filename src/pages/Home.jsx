import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { initHomeEffects, initReel } from '../lib/effects.js';
import Loading from '../components/Loading.jsx';
import AppointmentForm from '../components/AppointmentForm.jsx';
import WorkFan from '../components/WorkFan.jsx';
import { home, profile, contact, inProgress, microcopy } from '../data/site.js';

// Placeholder shots until real screenshots land in each project's coverImage.
const MOCKS = {
  'pacific-coast-contracting': '/mocks/mock-pcc.png',
  roohconnect: '/mocks/mock-rooh.png',
  exportkit: '/mocks/mock-exportkit.png',
  stratalite: '/mocks/mock-stratalite.png',
  skooltag: '/mocks/mock-skooltag.png'
};
const MOCK_CYCLE = Object.values(MOCKS);

const pad = (n, w) => String(n).padStart(w, '0');

export default function Home() {
  const rootRef = useRef(null);
  const slotRef = useRef(null);
  const reelRef = useRef(null);
  const trackRef = useRef(null);
  const heroLeftRef = useRef(null);
  const heroRightRef = useRef(null);
  const cueRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [reelOk, setReelOk] = useState(true);
  const [homeSettings, setHomeSettings] = useState({ videoUrl: '', videoPoster: '' });

  // Stable reference so unrelated Home re-renders (video fallback, settings
  // fetch resolving, etc.) don't cascade into WorkFan's GSAP effect and
  // interrupt an in-flight animation.
  const fanProjects = useMemo(
    () =>
      projects.map((p, i) => ({
        ...p,
        image: p.coverImage || MOCKS[p.slug] || MOCK_CYCLE[i % MOCK_CYCLE.length]
      })),
    [projects]
  );

  useEffect(() => {
    Promise.all([api.listProjects(), api.getHomeSettings()])
      .then(([projects, settings]) => {
        setProjects(projects);
        setHomeSettings(settings);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => initHomeEffects(rootRef.current), []);

  useEffect(
    () =>
      initReel({
        slot: slotRef.current,
        reel: reelRef.current,
        track: trackRef.current,
        fadeOut: [heroLeftRef.current, heroRightRef.current, cueRef.current]
      }),
    []
  );

  return (
    <div ref={rootRef}>
      {/* ---------- Hero ---------- */}
      <section className="fx-hero">
        <div className="fx-hero-left" ref={heroLeftRef}>
          <span className="fx-scribble" aria-hidden="true">
            {home.scribble}
          </span>
          <h1 data-cursor="factory">
            {Array.isArray(home.headline) ? home.headline.join(' ') : home.headline}
          </h1>
          <div className="fx-hero-meta">{home.heroMeta}</div>
        </div>

        <div className="fx-reel-slot" ref={slotRef}>
          <div className="fx-reel" ref={reelRef}>
            {reelOk && homeSettings.videoUrl ? (
              <video
                className="fx-reel-media"
                src={homeSettings.videoUrl}
                poster={homeSettings.videoPoster || '/mocks/mock-portrait.png'}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Showreel of selected work"
                onError={() => setReelOk(false)}
              />
            ) : reelOk ? (
              <video
                className="fx-reel-media"
                src="/mocks/reel.mp4"
                poster="/mocks/mock-portrait.png"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Showreel of selected work"
                onError={() => setReelOk(false)}
              />
            ) : (
              <img
                className="fx-reel-media"
                src={homeSettings.videoPoster || '/mocks/mock-portrait.png'}
                alt="Showreel placeholder"
              />
            )}
          </div>
        </div>

        <div className="fx-hero-right" ref={heroRightRef}>
          <div className="fx-hand-note">{home.handNote}</div>
          <p>
            {home.heroPara.before}
            <b>{home.heroPara.bold}</b>
            {home.heroPara.after}
          </p>
          <div className="fx-avail">
            <span className="fx-dot" />
            {home.availability}
          </div>
        </div>

        <div className="fx-scroll-cue" ref={cueRef}>
          ( scroll ↓ )
        </div>
      </section>

      {/* Scroll runway for the reel's expand → hold → exit sequence. */}
      <div className="fx-reel-track" ref={trackRef} aria-hidden="true" />

      {/* ---------- Selected Work ---------- */}
      <section id="work" className="work-sec">
        <div className="sec-head">
          <h2 className="sec-title">Selected Work</h2>
          <span className="sec-count">( {pad(projects.length || 5, 2)} )</span>
        </div>

        {!loaded ? (
          <Loading />
        ) : projects.length === 0 ? (
          <div className="empty">
            <h3>Nothing published yet</h3>
            <p>{microcopy.workEmpty}</p>
          </div>
        ) : (
          <WorkFan projects={fanProjects} />
        )}
      </section>

      {/* ---------- In Progress ---------- */}
      <section id="progress" className="progress-sec">
        <div className="sec-head">
          <h2 className="sec-title">In Progress</h2>
          <span className="sec-count">( {pad(inProgress.items.length, 2)} )</span>
        </div>
        <p className="progress-intro">{home.progressIntro}</p>
        <div>
          {inProgress.items.map((item, i) => (
            <div className="prog-row" key={item.name}>
              <span className="prog-index">{pad(i + 1, 3)}</span>
              <div>
                <div className="prog-name">{item.name}</div>
                <div className="prog-detail">{item.detail}</div>
              </div>
              <div
                className="prog-track"
                role="progressbar"
                aria-valuenow={item.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={item.name}
              >
                <div className="prog-fill" style={{ width: `${item.percent}%` }} />
              </div>
              <span className="prog-pct">{item.percent}%</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- About ---------- */}
      <section id="about" className="about-sec">
        <h2 className="sec-title">About</h2>
        <div>
          <p className="about-statement">{home.aboutStatement}</p>
          <p className="about-para">{home.aboutPara}</p>
        </div>
      </section>

      {/* ---------- Contact ---------- */}
      <section id="contact" className="contact-sec" data-cursor="paw">
        <h2 className="sec-title">Contact</h2>
        <div>
          <div className="contact-hand" aria-hidden="true">
            {home.contactHand}
          </div>
          <h3 className="contact-title">Let&rsquo;s talk</h3>
          <p className="contact-para">{contact.body}</p>
          <div className="contact-list">
            <div className="contact-list-row">
              <span className="k">Based in</span>
              <span className="v">{profile.location}</span>
            </div>
            <div className="contact-list-row">
              <span className="k">Role</span>
              <span className="v">{profile.role}</span>
            </div>
            <div className="contact-list-row">
              <span className="k">Status</span>
              <span className="v">
                <span className="fx-dot" />
                {profile.status}
              </span>
            </div>
          </div>
        </div>
        <AppointmentForm />
      </section>
    </div>
  );
}
