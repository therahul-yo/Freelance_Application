import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Button from './Button';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  if (isAuthPage) return null;

  const isFreelancer = user?.role === 'freelancer';
  const isClient = user?.role === 'client';

  const NavLink = ({ to, children }) => {
    const isActive =
      location.pathname === to ||
      (to !== '/' && location.pathname.startsWith(to));
    return (
      <Link
        to={to}
        className={`nav-link ${isActive ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      >
        {children}
      </Link>
    );
  };

  const marqueeItems = [
    'FREELANCE MARKETPLACE',
    'POST JOBS',
    'HIRE TALENT',
    'REAL-TIME CHAT',
    'ZERO PLATFORM FEE',
    'BROWSE GIGS',
    'SUBMIT PROPOSALS',
    'GROW YOUR BUSINESS',
  ];

  return (
    <>
      {/* TICKER */}
      <div className="neo-ticker ticker-bar">
        <div style={{ overflow: 'hidden' }}>
          <div className="marquee-track">
            {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="marquee-item">
                <span className="marquee-dot" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="site-nav navbar">
        <div className="navbar-inner">
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <Link to="/" className="nav-logo navbar-logo">
              SMITH<span className="navbar-logo-accent nav-logo-accent">WORKS</span>
            </Link>

            <div className="navbar-links nav-links">
              {(!user || isFreelancer) && <NavLink to="/projects">Find Jobs</NavLink>}
              {(!user || isClient) && <NavLink to="/gigs">Find Talent</NavLink>}
              {user && (
                <>
                  <NavLink to="/dashboard">Dashboard</NavLink>
                  <NavLink to="/chat">Messages</NavLink>
                  <NavLink to="/notifications">
                    Alerts
                    {unreadCount > 0 && (
                      <span
                        style={{
                          background: 'var(--red)',
                          color: 'var(--white)',
                          padding: '2px 6px',
                          fontSize: 10,
                          marginLeft: 6,
                          border: '2px solid var(--ink)',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          lineHeight: 1,
                        }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </NavLink>
                </>
              )}
            </div>
          </div>

          <div className="navbar-actions nav-cta-group">
            {user ? (
              <>
                {isFreelancer && (
                  <Link to="/post-gig">
                    <Button size="sm">+ Create Gig</Button>
                  </Link>
                )}
                {isClient && (
                  <Link to="/post-job">
                    <Button size="sm">+ Post Job</Button>
                  </Link>
                )}
                <div className="navbar-user-tag">{user.name}</div>
                <Button variant="outline" size="sm" onClick={logout}>
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up →</Button>
                </Link>
              </>
            )}

            <button
              className="navbar-hamburger"
              onClick={() => setMobileOpen((p) => !p)}
              aria-label="Menu"
            >
              <span style={{ transform: mobileOpen ? 'rotate(45deg) translate(4px, 6px)' : 'none' }} />
              <span style={{ opacity: mobileOpen ? 0 : 1 }} />
              <span style={{ transform: mobileOpen ? 'rotate(-45deg) translate(4px, -6px)' : 'none' }} />
            </button>
          </div>
        </div>

        <div className={`navbar-mobile-menu ${mobileOpen ? 'open' : ''}`}>
          {(!user || isFreelancer) && <NavLink to="/projects">Find Jobs</NavLink>}
          {(!user || isClient) && <NavLink to="/gigs">Find Talent</NavLink>}
          {user && (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/chat">Messages</NavLink>
              <NavLink to="/notifications">Alerts {unreadCount > 0 && `(${unreadCount})`}</NavLink>
              {isFreelancer && <NavLink to="/post-gig">+ Create Gig</NavLink>}
              {isClient && <NavLink to="/post-job">+ Post Job</NavLink>}
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                style={{
                  marginTop: 8,
                  padding: '12px 16px',
                  border: '3px solid var(--yellow)',
                  background: 'var(--yellow)',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Log Out
              </button>
            </>
          )}
          {!user && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Link to="/login" style={{ flex: 1 }} onClick={() => setMobileOpen(false)}>
                <Button variant="outline" size="sm" style={{ width: '100%' }}>Log In</Button>
              </Link>
              <Link to="/register" style={{ flex: 1 }} onClick={() => setMobileOpen(false)}>
                <Button size="sm" style={{ width: '100%' }}>Sign Up →</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .navbar-hamburger { display: flex !important; }
          .navbar-links { display: none; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
