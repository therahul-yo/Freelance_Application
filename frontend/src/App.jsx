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

const featureCards = [
  {
    icon: "🎯",
    color: "feature-icon-pink",
    cardBg: "",
    title: "Scope Work Clearly",
    body: "Post a detailed project with budget and skills to attract the right specialists.",
  },
  {
    icon: "🏪",
    color: "feature-icon-blue",
    cardBg: "",
    title: "Service Storefronts",
    body: "Browse standardized freelancer gigs to buy proven outcomes instantly.",
  },
  {
    icon: "💬",
    color: "feature-icon-yellow",
    cardBg: "",
    title: "Direct Collaboration",
    body: "Native messaging and proposal tracking keep the entire deal in one place.",
  },
];

const LandingPage = () => (
  <div>
    {/* ===== HERO SECTION ===== */}
    <section className="container landing-hero" style={{ position: 'relative' }}>
      {/* Decorative shapes */}
      <div className="deco-blob hero-deco-1" style={{ borderRadius: '0 !important' }} />
      <div className="deco-blob hero-deco-2" style={{ borderRadius: '50%' }} />
      <div className="deco-blob hero-deco-3" style={{ borderRadius: '0 !important' }} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Sticker badges */}
        <div className="hero-stickers">
          <span className="sticker sticker-1">Web Dev</span>
          <span className="sticker sticker-2">UX/UI Design</span>
          <span className="sticker sticker-3">Frontend</span>
          <span className="sticker sticker-4">Marketing</span>
          <span className="sticker sticker-5">Data Science</span>
        </div>

        <div className="hero-badge-row">
          <span className="badge badge-dark">Freelance Marketplace</span>
          <span className="badge badge-pink">v2.0</span>
        </div>

        <h1 className="hero-title">
          Build, hire,{" "}
          <span className="hero-title-accent">and close</span>{" "}
          work in{" "}
          <span className="hero-title-highlight">one place</span>.
        </h1>

        <p className="hero-subtitle">
          Smith Works is a two-sided marketplace: clients post work,
          freelancers pitch and publish gigs, and both sides move into direct chat 
          when there is a fit.
        </p>

        <div className="hero-cta-row">
          <Link to="/register">
            <Button style={{ padding: "18px 36px", fontSize: 16 }}>
              Create an account →
            </Button>
          </Link>
          <Link to="/projects">
            <Button variant="outline" style={{ padding: "18px 36px", fontSize: 16 }}>
              Browse projects
            </Button>
          </Link>
        </div>

        {/* Feature pills */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
          gap: 12 
        }}>
          {["Projects & Gigs", "Proposal Flow", "Real-time Chat"].map((item, i) => (
            <div
              key={item}
              style={{
                border: "var(--nb-border)",
                background: i === 0 ? "var(--nb-yellow)" : i === 1 ? "var(--nb-blue)" : "var(--nb-lime)",
                padding: "14px 20px",
                fontSize: 14,
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#1a1a2e",
                boxShadow: "var(--nb-shadow-sm)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 20 }}>{["📦", "📋", "⚡"][i]}</span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ===== SMILEY + STATS SECTION ===== */}
    <section className="stats-section" style={{ borderTop: 'var(--nb-border)', borderBottom: 'var(--nb-border)' }}>
      <div className="container" style={{ padding: 'var(--space-2xl) 0' }}>
        <div className="stats-banner" style={{ border: 'none', boxShadow: 'none', background: 'transparent' }}>
          <div className="stats-banner-item">
            <div className="stats-banner-number">∞</div>
            <div className="stats-banner-label">Opportunities</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="smiley">
              <div className="smiley-eye smiley-eye-left" />
              <div className="smiley-eye smiley-eye-right" />
              <div className="smiley-mouth" />
            </div>
          </div>
          <div className="stats-banner-item">
            <div className="stats-banner-number">24/7</div>
            <div className="stats-banner-label">Always Open</div>
          </div>
          <div className="stats-banner-item">
            <div className="stats-banner-number">$0</div>
            <div className="stats-banner-label">Platform Fee</div>
          </div>
        </div>
      </div>
    </section>

    {/* ===== FEATURES SECTION ===== */}
    <section className="container page-section">
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <span className="badge badge-purple" style={{ marginBottom: 12, display: 'inline-flex' }}>How it works</span>
        <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
          Everything you need
        </h2>
      </div>

      <div className="three-column-grid">
        {featureCards.map((feature, idx) => (
          <div key={feature.title} className="card" style={{ 
            background: idx === 0 ? 'var(--nb-lavender)' : idx === 1 ? 'var(--nb-cream)' : 'var(--nb-lime)',
          }}>
            <div className={`feature-icon ${feature.color}`} style={{ marginBottom: 18 }}>
              {feature.icon}
            </div>
            <h3 style={{ 
              fontSize: 22, 
              marginBottom: 10, 
              fontFamily: 'var(--font-heading)',
            }}>
              {feature.title}
            </h3>
            <p style={{ color: "var(--nb-text-secondary)", fontSize: 15, lineHeight: 1.6 }}>
              {feature.body}
            </p>
          </div>
        ))}
      </div>
    </section>

    {/* ===== TWO SIDES SECTION ===== */}
    <section className="container page-section" style={{ paddingTop: 0 }}>
      <div className="two-column-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Client Side */}
        <div className="card" style={{ background: 'var(--nb-yellow)', color: '#08080A' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '6px 14px', 
            background: '#08080A', 
            color: 'var(--nb-yellow)',
            border: '3px solid #08080A',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 12,
            textTransform: 'uppercase',
            marginBottom: 18,
          }}>
            👤 Client Side
          </div>
          <h2 style={{ fontSize: 32, marginBottom: 14, fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
            Scope work clearly, then hire with less noise.
          </h2>
          <p style={{ color: "var(--nb-text-secondary)", marginBottom: 24, fontSize: 16, lineHeight: 1.5 }}>
            Publish a job, compare incoming proposals, message candidates, and accept the best
            freelancer without juggling separate tools.
          </p>
          <Link to="/post-job">
            <Button variant="dark">Post a project →</Button>
          </Link>
        </div>

        {/* Freelancer Side */}
        <div className="card" style={{ background: 'var(--nb-hot-pink)', color: '#FFFCF2' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '6px 14px', 
            background: '#FFFCF2', 
            color: 'var(--nb-hot-pink)',
            border: '3px solid #FFFCF2',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 12,
            textTransform: 'uppercase',
            marginBottom: 18,
          }}>
            ⚡ Freelancer Side
          </div>
          <h2 style={{ fontSize: 32, marginBottom: 14, fontFamily: 'var(--font-display)', textTransform: 'uppercase', color: '#FFFCF2' }}>
            Package services, apply to jobs, and track deals.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.85)", marginBottom: 24, fontSize: 16, lineHeight: 1.5 }}>
            Keep a public service profile through gigs, submit proposals to open jobs, and manage
            active opportunities from one dashboard.
          </p>
          <Link to="/post-gig">
            <Button style={{ background: '#FFFCF2', color: 'var(--nb-hot-pink)', border: '3px solid #FFFCF2' }}>Create a gig →</Button>
          </Link>
        </div>
      </div>
    </section>

    {/* ===== CTA SECTION ===== */}
    <section className="cta-section" style={{ background: '#08080A', borderTop: 'var(--nb-border)' }}>
      <div className="cta-zigzag" />
      <div className="container" style={{ padding: 'var(--space-4xl) 0', textAlign: 'center' }}>
        <span className="deco-star" style={{ fontSize: 48, marginBottom: 16, display: 'block' }}>✦</span>
        <h2 style={{ 
          fontSize: 'clamp(36px, 6vw, 64px)', 
          color: '#FFFCF2', 
          fontFamily: 'var(--font-display)', 
          textTransform: 'uppercase',
          marginBottom: 20,
        }}>
          Ready to get started?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18, marginBottom: 32, maxWidth: 500, marginInline: 'auto' }}>
          Join thousands of freelancers and clients closing deals every day.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register">
            <Button style={{ padding: '18px 40px', fontSize: 16, background: 'var(--nb-yellow)', color: '#08080A' }}>
              Sign Up Free →
            </Button>
          </Link>
          <Link to="/projects">
            <Button variant="outline" style={{ padding: '18px 40px', fontSize: 16, color: '#FFFCF2', borderColor: '#FFFCF2' }}>
              Browse Projects
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '2px solid rgba(255,255,255,0.15)', padding: '24px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            © 2026 SMITH WORKS — ALL RIGHTS RESERVED
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Terms', 'Privacy', 'Support'].map(item => (
              <a key={item} href="#" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 600 }}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
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
              <ToastContainer 
                toastStyle={{ 
                  backgroundColor: "var(--nb-white)", 
                  color: "var(--nb-text)",
                  border: "3px solid var(--nb-black)",
                  borderRadius: 0,
                  boxShadow: "4px 4px 0px var(--nb-black)",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                }} 
                position="top-right" 
              />
              <div className="unfold-animate">
                <ErrorBoundary>
                  <Suspense fallback={<div className="container" style={{ padding: 'var(--space-4xl) 0', textAlign: 'center', display: 'flex', justifyContent: 'center' }}><div className="neo-loading">Loading App...</div></div>}>
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
