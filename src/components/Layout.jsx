import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { profile } from '../data/site.js';

function useIstClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Kolkata'
        })
      );
    tick();
    const timer = setInterval(tick, 30000);
    return () => clearInterval(timer);
  }, []);
  return time;
}

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const time = useIstClock();
  const onHome = pathname === '/';
  // The admin editor needs more room than the reading column allows.
  const wide = pathname.startsWith('/admin');
  // Homepage sections span the full viewport; inner pages keep a reading column.
  const wrap = onHome ? '' : wide ? 'wrap-wide' : 'wrap';

  return (
    <>
      <header className="site-head">
        <a href={onHome ? '#work' : '/work'}>works</a>
        <span className="site-name">
          <Link to="/" aria-label="Abhishek Manjhi">
            <img src="/signature.png" alt="Abhishek Manjhi" className="nav-signature-img" />
          </Link>
        </span>
        <a href={onHome ? '#contact' : '/contact'}>contact</a>
      </header>
      <div className="top-glass" aria-hidden="true" />

      <main className={wrap}>{children}</main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <span>©{new Date().getFullYear()} — Abhishek Manjhi</span>
          <div className="site-footer-links">
            <a href={`mailto:${profile.email}`}>Email</a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href={profile.resume}>Resume</a>
          </div>
          <span>Mumbai — {time}</span>
        </div>
      </footer>
    </>
  );
}
