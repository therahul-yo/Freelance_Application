import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { NotificationProvider } from "./context/NotificationContext";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Chat from "./pages/Chat/index";
import Notifications from "./pages/Notifications/index";
import Projects from "./pages/Project/index";
import PostJob from "./pages/Project/PostJob";
import JobDetails from "./pages/Project/JobDetails";
import Dashboard from "./pages/Dashboard/index";
import BrowseGigs from "./pages/Gig/index";
import PostGig from "./pages/Gig/PostGig";
import GigDetails from "./pages/Gig/GigDetails";
import Button from "./components/Button";

const featureCards = [
  {
    title: "Scope work clearly",
    body: "Post a detailed project with budget and skills to attract the right specialists.",
  },
  {
    title: "Service storefronts",
    body: "Browse standardized freelancer gigs to buy proven outcomes instantly.",
  },
  {
    title: "Direct collaboration",
    body: "Native messaging and proposal tracking keep the entire deal in one place.",
  },
];

const LandingPage = () => (
  <div>
    <section className="container page-section" style={{ paddingTop: 56 }}>
      <div
        className="card"
        style={{
          padding: 32,
          overflow: "hidden",
          position: "relative",
          background:
            "radial-gradient(circle at top right, rgba(190, 242, 100, 0.16), transparent 25%), linear-gradient(145deg, rgba(16, 25, 40, 0.98), rgba(8, 13, 22, 0.96))",
        }}
      >
        <div className="card-laser-border" />
        <div style={{ maxWidth: 720, position: "relative", zIndex: 1 }}>
          <p
            style={{
              display: "inline-flex",
              padding: "8px 12px",
              borderRadius: 999,
              background: "rgba(125, 211, 252, 0.12)",
              border: "1px solid rgba(125, 211, 252, 0.22)",
              color: "var(--color-accent-primary)",
              fontSize: 13,
              marginBottom: 18,
            }}
          >
            MERN freelance marketplace
          </p>
          <h1 style={{ fontSize: "clamp(42px, 7vw, 72px)", lineHeight: 1.02, marginBottom: 18 }}>
            Build, hire, and close work in one serious workflow.
          </h1>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: 18,
              maxWidth: 640,
              marginBottom: 28,
            }}
          >
            Smith Works now behaves like a real two-sided marketplace: clients post work,
            freelancers pitch and publish gigs, and both sides move into direct chat when there
            is a fit.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
            <Link to="/register">
              <Button style={{ padding: "14px 24px" }}>Create an account</Button>
            </Link>
            <Link to="/projects">
              <Button variant="outline" style={{ padding: "14px 24px" }}>
                Browse projects
              </Button>
            </Link>
            <Link to="/gigs">
              <Button variant="outline" style={{ padding: "14px 24px" }}>
                Explore talent
              </Button>
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 12,
              maxWidth: 760,
            }}
          >
            {[
              "Projects and gigs",
              "Proposal acceptance flow",
              "Direct client-freelancer messaging",
            ].map((item) => (
              <div
                key={item}
                style={{
                  border: "1px solid var(--color-border)",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 18,
                  padding: 14,
                  fontSize: 13,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    <section className="container page-section" style={{ paddingTop: 0 }}>
      <div className="three-column-grid">
        {featureCards.map((feature) => (
          <div key={feature.title} className="card">
            <div className="card-laser-border" />
            <h3 style={{ fontSize: 22, marginBottom: 10 }}>{feature.title}</h3>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 15 }}>{feature.body}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="container page-section" style={{ paddingTop: 0 }}>
      <div className="two-column-grid">
        <div className="card">
          <div className="card-laser-border" />
          <p style={{ color: "var(--color-accent-secondary)", fontSize: 13, marginBottom: 8 }}>
            For clients
          </p>
          <h2 style={{ fontSize: 32, marginBottom: 16 }}>Scope work clearly, then hire with less noise.</h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 20 }}>
            Publish a job, compare incoming proposals, message candidates, and accept the best
            freelancer without juggling separate tools.
          </p>
          <Link to="/post-job">
            <Button>Post a project</Button>
          </Link>
        </div>
        <div className="card">
          <div className="card-laser-border" />
          <p style={{ color: "var(--color-accent-primary)", fontSize: 13, marginBottom: 8 }}>
            For freelancers
          </p>
          <h2 style={{ fontSize: 32, marginBottom: 16 }}>Package services, apply to jobs, and track live deals.</h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 20 }}>
            Keep a public service profile through gigs, submit proposals to open jobs, and manage
            active opportunities from one dashboard.
          </p>
          <Link to="/post-gig">
            <Button>Create a gig</Button>
          </Link>
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
              <ToastContainer theme="dark" position="top-right" />
              <div className="unfold-animate">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/post-job" element={<PostJob />} />
                  <Route path="/jobs/:id" element={<JobDetails />} />
                  <Route path="/gigs" element={<BrowseGigs />} />
                  <Route path="/post-gig" element={<PostGig />} />
                  <Route path="/gigs/:id" element={<GigDetails />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/notifications" element={<Notifications />} />
                </Routes>
              </div>
            </div>
          </Router>
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
