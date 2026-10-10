import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { initInteractionSystem } from './lib/interaction.js';

// Image skeletons: photos show a grey shimmer until they load. Load and error
// don't bubble, so one capturing listener covers every image on every page.
if (typeof document !== 'undefined') {
  const markLoaded = (e) => {
    if (e.target instanceof HTMLImageElement) e.target.classList.add('is-loaded');
  };
  document.addEventListener('load', markLoaded, true);
  document.addEventListener('error', markLoaded, true);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

if (typeof window !== 'undefined') {
  initInteractionSystem();
}
