import { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Splash from './components/Splash.jsx';
import Home from './pages/Home.jsx';
import Work from './pages/Work.jsx';
import WorkDetail from './pages/WorkDetail.jsx';
import Writing from './pages/Writing.jsx';
import WritingDetail from './pages/WritingDetail.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';
import Tracker from './pages/Tracker.jsx';
import Access from './pages/Access.jsx';
import DesignIndex from './pages/DesignIndex.jsx';
import DesignDetail from './pages/DesignDetail.jsx';
import { api } from './lib/api.js';

export default function App() {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const isStandaloneTool = pathname.startsWith('/tracker');
  // The portfolio is public. Only the personal tracker still asks for the
  // access password, so the check runs only there.
  const [trackerAccess, setTrackerAccess] = useState({ checking: true, ok: false });
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash once per session on initial load
    return !sessionStorage.getItem('hasSeenSplash');
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  };

  useEffect(() => {
    if (!isStandaloneTool) return undefined;
    let alive = true;
    api
      .checkAccess()
      .then((result) => {
        if (alive) setTrackerAccess({ checking: false, ok: !result.required || result.ok });
      })
      .catch(() => {
        if (alive) setTrackerAccess({ checking: false, ok: false });
      });
    return () => {
      alive = false;
    };
  }, [isStandaloneTool]);

  // A share link lands on "/" or "/?link=expired". Drop the leftover flag so it
  // does not end up in a URL someone copies. Replace, not push.
  useEffect(() => {
    const params = new URLSearchParams(search);
    if (!params.has('link')) return;
    params.delete('link');
    const rest = params.toString();
    navigate({ pathname, search: rest ? `?${rest}` : '', hash }, { replace: true });
  }, [pathname, search, hash, navigate]);

  if (isStandaloneTool) {
    if (trackerAccess.checking) return <div className="sk-blank" aria-busy="true" />;
    if (!trackerAccess.ok) {
      return <Access onUnlock={() => setTrackerAccess({ checking: false, ok: true })} />;
    }
    return (
      <Routes>
        <Route path="/tracker" element={<Tracker />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  return (
    <>
      {showSplash && <Splash onComplete={handleSplashComplete} />}
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:slug" element={<WorkDetail />} />
          <Route path="/design" element={<DesignIndex />} />
          <Route path="/design/:slug" element={<DesignDetail />} />
          <Route path="/writing" element={<Writing />} />
          <Route path="/writing/:slug" element={<WritingDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </>
  );
}
