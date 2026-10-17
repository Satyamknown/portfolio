import { useEffect, useState } from 'react';

// The design pages sit outside the site Layout, so they carry its two notices themselves: the
// cookie note (same 'cookiesAccepted' key as the rest of the site), then, on phones only, a nudge
// toward a desktop. One at a time, just under the header.
const read = (store, key) => {
  try {
    return window[store].getItem(key);
  } catch {
    return null;
  }
};
const write = (store, key) => {
  try {
    window[store].setItem(key, 'true');
  } catch {
    /* fine: the note just comes back next time */
  }
};

export default function DesignNotices({ ready = true }) {
  const [cookies, setCookies] = useState(true);
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    setCookies(read('localStorage', 'cookiesAccepted') === 'true');
    setPhone(window.matchMedia('(max-width: 760px), (pointer: coarse)').matches && read('sessionStorage', 'designDesktopNote') !== 'true');
  }, []);
  if (!ready) return null;
  if (!cookies)
    return (
      <div className="dn" role="dialog" aria-live="polite" aria-label="Cookies">
        <p>This site uses cookies to remember your preferences.</p>
        <button
          type="button"
          className="dn-btn"
          onClick={() => {
            write('localStorage', 'cookiesAccepted');
            setCookies(true);
          }}
        >
          Accept
        </button>
      </div>
    );
  if (phone)
    return (
      <div className="dn" role="status" aria-live="polite">
        <p>Please view this site on a desktop for the best experience.</p>
        <button
          type="button"
          className="dn-x"
          aria-label="Dismiss"
          onClick={() => {
            write('sessionStorage', 'designDesktopNote');
            setPhone(false);
          }}
        >
          ×
        </button>
      </div>
    );
  return null;
}
