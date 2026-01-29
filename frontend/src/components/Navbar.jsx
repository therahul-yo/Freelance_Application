import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  if (isAuthPage) return null;

  const isFreelancer = user?.role === 'freelancer';
  const isClient = user?.role === 'client';

  return (
    <nav style={{ 
      borderBottom: '1px solid var(--color-border)',
      padding: '1rem 0',
      background: 'var(--color-bg-primary)',
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.5px' }}>
            Smith Works
          </Link>
          
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {/* Freelancers see Find Jobs (to apply) */}
            {(!user || isFreelancer) && (
              <Link 
                to="/projects" 
                style={{ 
                  color: location.pathname === '/projects' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', 
                  fontSize: '14px' 
                }}
              >
                Find Jobs
              </Link>
            )}
            
            {/* Clients see Find Talent (to hire) */}
            {(!user || isClient) && (
              <Link 
                to="/gigs" 
                style={{ 
                  color: location.pathname.startsWith('/gig') ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', 
                  fontSize: '14px' 
                }}
              >
                Find Talent
              </Link>
            )}

            {user && (
              <>
                <Link 
                  to="/dashboard" 
                  style={{ 
                    color: location.pathname === '/dashboard' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', 
                    fontSize: '14px' 
                  }}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/chat" 
                  style={{ 
                    color: location.pathname === '/chat' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', 
                    fontSize: '14px' 
                  }}
                >
                  Messages
                </Link>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <>
              {isFreelancer && (
                <Link to="/post-gig">
                  <Button style={{ padding: '8px 16px', fontSize: '13px' }}>Create Gig</Button>
                </Link>
              )}
              {isClient && (
                <Link to="/post-job">
                  <Button style={{ padding: '8px 16px', fontSize: '13px' }}>Post Job</Button>
                </Link>
              )}
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                {user.name}
              </span>
              <Button variant="outline" onClick={logout} style={{ padding: '8px 16px', fontSize: '13px' }}>
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" style={{ padding: '8px 16px', fontSize: '13px' }}>Log In</Button>
              </Link>
              <Link to="/register">
                <Button style={{ padding: '8px 16px', fontSize: '13px' }}>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
