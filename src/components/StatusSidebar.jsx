import { useEffect, useMemo, useRef, useState } from 'react';

const AUDIO_SRC = '/music/saturn-3-music-beethoven-moonlight-sonata-first-theme-piano-sonata-no-14-401567.mp3';

function getStatus(hour) {
  if (hour >= 10 && hour < 18) return { variant: 'online', text: 'At work' };
  if (hour >= 18 && hour < 21) return { variant: 'online', text: 'Might be free' };
  if (hour >= 21 && hour < 23) return { variant: 'idle', text: 'At gym' };
  if (hour >= 23 || hour < 6) return { variant: 'sleep', text: 'Sleeping z' };
  if (hour >= 7 && hour < 10) return { variant: 'online', text: 'Drop an email' };
  return { variant: 'idle', text: 'Early hours' };
}

export default function StatusSidebar() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hour, setHour] = useState(() => new Date().getHours());
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.preload = 'metadata';
    audio.loop = false;

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);
    audioRef.current = audio;

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  useEffect(() => {
    const tick = () => setHour(new Date().getHours());
    const interval = window.setInterval(tick, 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  const status = useMemo(() => getStatus(hour), [hour]);
  const label = useMemo(() => `${hour.toString().padStart(2, '0')}:00`, [hour]);
  const statusLine = useMemo(() => `${label} · ${status.text}`, [label, status]);

  const scrollBottom = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    if (audio.ended) {
      audio.currentTime = 0;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      // autoplay may fail without gesture; keep the button state consistent
      console.warn('Audio playback failed', error);
    }
  };

  return (
    <aside className="status-sidebar" aria-label="Status panel">
      <div className="status-sidebar-row">
        <span className="status-sidebar-title">Moonlight Sonata</span>
        <button
          type="button"
          className="status-sidebar-play"
          onClick={togglePlay}
          aria-pressed={isPlaying}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
      <div className="status-sidebar-status">
        <span className={`status-sidebar-dot status-sidebar-dot--${status.variant}`} aria-hidden="true" />
        <span className="status-sidebar-line">{statusLine}</span>
      </div>
      <div className="status-sidebar-actions">
        <button type="button" className="btn btn-ghost btn-sm status-sidebar-contact" onClick={scrollBottom}>
          Look at my life ✨
        </button>
      </div>
    </aside>
  );
}
