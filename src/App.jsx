import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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
import { api } from './lib/api.js';

export default function App() {
  const { pathname } = useLocation();
  const isStandaloneTool = pathname.startsWith('/tracker');
  const [access, setAccess] = useState({ checking: true, ok: false });
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash once per session on initial load
    return !sessionStorage.getItem('hasSeenSplash');
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  };

  useEffect(() => {
    let alive = true;
    api
      .checkAccess()
      .then((result) => {
        if (alive) setAccess({ checking: false, ok: !result.required || result.ok });
      })
      .catch(() => {
        if (alive) setAccess({ checking: false, ok: false });
      });
    return () => {
      alive = false;
    };
  }, []);

  const handleAccessUnlock = () => setAccess({ checking: false, ok: true });

  if (access.checking) {
    return <div className="access-loading">Checking access...</div>;
  }

  if (!access.ok) {
    return <Access onUnlock={handleAccessUnlock} />;
  }

  if (isStandaloneTool) {
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
