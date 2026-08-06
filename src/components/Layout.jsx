import { Link, NavLink, useLocation } from 'react-router-dom';
import { microcopy } from '../data/site.js';

const NAV = [
  { to: '/work', label: 'Work' },
  { to: '/writing', label: 'Writing' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' }
];

export default function Layout({ children }) {
  const { pathname } = useLocation();
  // The admin editor needs more room than the reading column allows.
  const wide = pathname.startsWith('/admin');
  const wrap = wide ? 'wrap-wide' : 'wrap';

  return (
    <>
      <header className="topbar">
        <div className={`topbar-inner ${wide ? 'wide' : ''}`}>
          <Link to="/" className="brand">
            <b>Abhishek</b> <span className="brand-last">Manjhi</span>
          </Link>
          <nav className="nav-links">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className={wrap}>{children}</main>

      <footer className={wrap}>
        <div>{microcopy.footer}</div>
      </footer>
    </>
  );
}
