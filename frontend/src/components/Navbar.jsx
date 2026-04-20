import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Button from './Button';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  if (isAuthPage) return null;

  const isFreelancer = user?.role === 'freelancer';
  const isClient = user?.role === 'client';

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
    return (
      <Link to={to} className={`nav-link ${isActive ? 'active' : ''}`}>
        {children}
      </Link>
    );
  };

  const marqueeItems = [
    "★ Post Jobs", "◆ Browse Gigs", "★ Direct Chat", "◆ Hire Talent",
    "★ Track Proposals", "◆ Manage Projects", "★ Real-time Messaging", "◆ Freelance Marketplace"
  ];

  return (
    <>
      {/* Ticker Bar */}
      <div className="ticker-bar">
        <div style={{ overflow: 'hidden' }}>
          <div className="marquee-track">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="marquee-item">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
            <Link to="/" className="navbar-logo">
              SMITH<span className="navbar-logo-accent">WORKS</span>
            </Link>
            
            <div className="navbar-links">
              {(!user || isFreelancer) && (
                <NavLink to="/projects">Find Jobs</NavLink>
              )}
              
              {(!user || isClient) && (
                <NavLink to="/gigs">Find Talent</NavLink>
              )}

              {user && (
                <>
                  <NavLink to="/dashboard">Dashboard</NavLink>
                  <NavLink to="/chat">Messages</NavLink>
                  <NavLink to="/notifications">
                    Alerts{unreadCount > 0 && (
                      <span style={{
                        background: 'var(--nb-hot-pink)',
                        color: 'var(--nb-white)',
                        padding: '2px 6px',
                        fontSize: '10px',
                        marginLeft: '6px',
                        border: '2px solid var(--nb-black)',
                        fontWeight: 800,
                      }}>
                        {unreadCount}
                      </span>
                    )}
                  </NavLink>
                </>
              )}
            </div>
          </div>

          <div className="navbar-actions">
            {user ? (
              <>
                {isFreelancer && (
                  <Link to="/post-gig">
                    <Button style={{ padding: '8px 16px', fontSize: '12px' }}>⚡ Create Gig</Button>
                  </Link>
                )}
                {isClient && (
                  <Link to="/post-job">
                    <Button style={{ padding: '8px 16px', fontSize: '12px' }}>📋 Post Job</Button>
                  </Link>
                )}
                <Link to="/profile/edit" className="navbar-user-tag" style={{ textDecoration: 'none' }}>
                  ✏️ {user.name}
                </Link>
                <Button variant="outline" onClick={logout} style={{ padding: '8px 16px', fontSize: '12px' }}>
                  Log Out
                </Button>
              </>
      ) : (
        <>
          <Link to="/login">
            <Button variant="outline" style={{ padding: '10px 22px', fontSize: '13px' }}>Log In</Button>
          </Link>
          <Link to="/register">
            <Button style={{ padding: '10px 22px', fontSize: '13px' }}>Sign Up →</Button>
          </Link>
        </>
      )}
    </div>
  </div>
</nav>
</>
);
};

export default Navbar;
