import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Navbar from "./components/Navbar";
import { ProtectedRoute, ClientRoute, FreelancerRoute, GuestRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { NotificationProvider } from "./context/NotificationContext";
import Button from "./components/Button";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy Loaded Pages
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const Chat = lazy(() => import("./pages/Chat/index"));
const Notifications = lazy(() => import("./pages/Notifications/index"));
const Projects = lazy(() => import("./pages/Project/index"));
const PostJob = lazy(() => import("./pages/Project/PostJob"));
const JobDetails = lazy(() => import("./pages/Project/JobDetails"));
const Dashboard = lazy(() => import("./pages/Dashboard/index"));
const BrowseGigs = lazy(() => import("./pages/Gig/index"));
const PostGig = lazy(() => import("./pages/Gig/PostGig"));
const GigDetails = lazy(() => import("./pages/Gig/GigDetails"));
const EditProfile = lazy(() => import("./pages/Profile/EditProfile"));
const PublicProfile = lazy(() => import("./pages/Profile/PublicProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));

const LandingPage = () => (
  <div>
    {/* HERO */}
    <section className="hero landing-hero">
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 60, alignItems: 'end' }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 2,
            color: 'var(--blue)',
            marginBottom: 32,
            display: 'flex',
            gap: 16,
            alignItems: 'center',
          }}>
            <span style={{ width: 40, height: 3, background: 'var(--ink)' }} />
            ISSUE 01 / FREELANCE / 2026
          </div>

          <h1 className="hero-headline hero-title">
            Build.<br />
            Hire.<br />
            <span className="hero-highlight hero-title-highlight">Ship.</span>
          </h1>

          <p className="hero-subtext hero-subtitle">
            Smithworks is a two-sided marketplace cut from raw paper — clients post work,
            freelancers pitch and publish gigs, and both sides move into direct chat
            when there's a fit.
          </p>

          <div className="hero-actions hero-cta-row">
            <Link to="/register">
              <Button size="lg">Create Account →</Button>
            </Link>
            <Link to="/projects">
              <Button variant="outline" size="lg">Browse Projects</Button>
            </Link>
          </div>
        </div>

        <div style={{
          border: '4px solid var(--ink)',
          padding: 32,
          background: 'var(--yellow)',
          boxShadow: '6px 6px 0 var(--ink)',
          alignSelf: 'stretch',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 24,
          minHeight: 320,
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            ☆ FIELD NOTE
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 64, lineHeight: 0.9, textTransform: 'uppercase' }}>
            NO MIDDLEMAN
            <br />
            NO FEES
            <br />
            NO BS
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: 16, fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 14 }}>
            "Every deal closed on the platform — zero cut taken."
          </div>
        </div>
      </div>
    </section>

    {/* STATS STRIP */}
    <section className="stats-strip stats-section">
      <div className="stats-strip-inner stats-banner">
        <div className="stats-banner-item">
          <div className="stats-banner-number">∞</div>
          <div className="stats-banner-label">Opportunities Posted</div>
        </div>
        <div className="stats-banner-item">
          <div className="stats-banner-number">24/7</div>
          <div className="stats-banner-label">Always Live</div>
        </div>
        <div className="stats-banner-item">
          <div className="stats-banner-number">$0</div>
          <div className="stats-banner-label">Platform Fee</div>
        </div>
      </div>
    </section>

    {/* HOW IT WORKS */}
    <section className="container page-section" style={{ position: 'relative' }}>
      <div className="section-number">01</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 48, marginBottom: 48, alignItems: 'end' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)', marginBottom: 12 }}>
            § 01 — HOW IT WORKS
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 6vw, 80px)', textTransform: 'uppercase', lineHeight: 0.9 }}>
            A Working<br />System.
          </h2>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 540 }}>
          Three primitives. Sharp scope, fixed pricing, direct communication. Built for
          professionals who already know what they're doing.
        </p>
      </div>

      <div className="feature-grid">
        {[
          { num: '01', title: 'Scope Work', body: 'Post a detailed project with budget and required skills. Filter noise upfront.' },
          { num: '02', title: 'Service Storefronts', body: 'Browse productized freelancer gigs — buy a proven outcome, not vague hours.' },
          { num: '03', title: 'Direct Chat', body: 'Native messaging keeps every proposal, deliverable, and decision in one thread.' },
        ].map((f, i) => (
          <div key={f.num} className="card-static" style={{
            background: i === 1 ? 'var(--yellow)' : 'var(--white)',
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            minHeight: 280,
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 80, lineHeight: 0.85, color: 'var(--ink)' }}>
              {f.num}
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 32, textTransform: 'uppercase', lineHeight: 0.95 }}>
              {f.title}
            </h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.6, color: 'var(--muted)', marginTop: 'auto' }}>
              {f.body}
            </p>
          </div>
        ))}
      </div>
    </section>

    <hr className="section-rule" />

    {/* SPLIT — BOTH SIDES */}
    <section className="split-section">
      {/* CLIENT */}
      <div style={{ background: 'var(--paper)', borderRight: '4px solid var(--ink)', padding: '80px 60px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--blue)', marginBottom: 16 }}>
          § 02A — FOR CLIENTS
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5vw, 64px)', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 24 }}>
          Hire with<br />
          <span style={{ background: 'var(--yellow)', padding: '0 12px', border: '4px solid var(--ink)' }}>less noise.</span>
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.6, color: 'var(--muted)', marginBottom: 32, maxWidth: 480 }}>
          Publish a job, compare incoming proposals, message candidates, and accept the best
          freelancer without juggling separate tools.
        </p>
        <Link to="/post-job">
          <Button>Post a Project →</Button>
        </Link>
      </div>

      {/* FREELANCER */}
      <div style={{ background: 'var(--ink)', color: 'var(--white)', padding: '80px 60px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--yellow)', marginBottom: 16 }}>
          § 02B — FOR FREELANCERS
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5vw, 64px)', textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 24, color: 'var(--white)' }}>
          Package.<br />
          Pitch. <span style={{ background: 'var(--red)', color: 'var(--white)', padding: '0 12px', border: '4px solid var(--white)' }}>Profit.</span>
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.6, color: 'rgba(255,255,255,0.75)', marginBottom: 32, maxWidth: 480 }}>
          Keep a public service profile through gigs, submit proposals to open jobs, and manage
          active opportunities from one dashboard.
        </p>
        <Link to="/post-gig">
          <Button variant="dark" style={{ background: 'var(--yellow)', color: 'var(--ink)', borderColor: 'var(--yellow)' }}>
            Create a Gig →
          </Button>
        </Link>
      </div>
    </section>

    {/* CTA BLOCK */}
    <section className="cta-block cta-section">
      <div className="cta-block-inner">
        <h2>
          Ready to<br />
          <span style={{ color: 'var(--yellow)' }}>get to work?</span>
        </h2>
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: 'rgba(255,255,255,0.7)', marginBottom: 32, lineHeight: 1.5 }}>
            Join thousands of freelancers and clients closing real deals — without the platform tax.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/register">
              <Button size="lg">Sign Up Free →</Button>
            </Link>
            <Link to="/projects">
              <Button variant="outline" size="lg" style={{ background: 'transparent', color: 'var(--white)', borderColor: 'var(--white)', boxShadow: '6px 6px 0 var(--yellow)' }}>
                Browse Projects
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* FOOTER */}
    <footer className="site-footer">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <p>© 2026 SMITHWORKS — ALL RIGHTS RESERVED</p>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Terms', 'Privacy', 'Support'].map(item => (
            <a key={item} href="#">{item}</a>
          ))}
        </div>
      </div>
    </footer>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          <Router>
            <div className="app-shell">
              <Navbar />
              <ToastContainer position="top-right" />
              <div className="unfold-animate">
                <ErrorBoundary>
                  <Suspense fallback={<div className="container" style={{ padding: '80px 0', textAlign: 'center' }}><div className="neo-loading">Loading...</div></div>}>
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
                      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                      <Route path="/users/:id" element={<PublicProfile />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/post-job" element={<ClientRoute><PostJob /></ClientRoute>} />
                      <Route path="/jobs/:id" element={<JobDetails />} />
                      <Route path="/gigs" element={<BrowseGigs />} />
                      <Route path="/post-gig" element={<FreelancerRoute><PostGig /></FreelancerRoute>} />
                      <Route path="/gigs/:id" element={<GigDetails />} />
                      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </div>
            </div>
          </Router>
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
