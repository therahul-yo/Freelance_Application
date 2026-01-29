import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Chat from "./pages/Chat/index";
import Projects from "./pages/Project/index";
import PostJob from "./pages/Project/PostJob";
import JobDetails from "./pages/Project/JobDetails";
import Dashboard from "./pages/Dashboard/index";
import BrowseGigs from "./pages/Gig/index";
import PostGig from "./pages/Gig/PostGig";
import GigDetails from "./pages/Gig/GigDetails";

const LandingPage = () => (
  <div>
    {/* Hero Section */}
    <div className="container" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
      <div style={{ maxWidth: "700px" }}>
        <h1 style={{ fontSize: "56px", fontWeight: "600", lineHeight: "1.1", marginBottom: "24px", letterSpacing: "-1px" }}>
          Connect with<br />top freelancers
        </h1>
        <p style={{ fontSize: "20px", color: "var(--color-text-secondary)", marginBottom: "40px", lineHeight: "1.6" }}>
          A modern platform to hire skilled professionals or find your next project. 
          Post jobs, browse talent, and collaborate seamlessly.
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <a href="/register"><button className="btn btn-primary" style={{ padding: "14px 28px", fontSize: "15px" }}>Get Started</button></a>
          <a href="/gigs"><button className="btn btn-outline" style={{ padding: "14px 28px", fontSize: "15px" }}>Browse Talent</button></a>
        </div>
      </div>
    </div>

    {/* Features Section */}
    <div style={{ borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}>
      <div className="container" style={{ padding: "40px 24px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "32px" }}>
        <div>
          <p style={{ fontSize: "20px", fontWeight: "600", marginBottom: "4px" }}>🎯</p>
          <p style={{ fontSize: "14px", color: "var(--color-text-tertiary)" }}>Direct Hiring</p>
        </div>
        <div>
          <p style={{ fontSize: "20px", fontWeight: "600", marginBottom: "4px" }}>💬</p>
          <p style={{ fontSize: "14px", color: "var(--color-text-tertiary)" }}>Real-time Chat</p>
        </div>
        <div>
          <p style={{ fontSize: "20px", fontWeight: "600", marginBottom: "4px" }}>📋</p>
          <p style={{ fontSize: "14px", color: "var(--color-text-tertiary)" }}>Easy Proposals</p>
        </div>
        <div>
          <p style={{ fontSize: "20px", fontWeight: "600", marginBottom: "4px" }}>🔒</p>
          <p style={{ fontSize: "14px", color: "var(--color-text-tertiary)" }}>Secure Platform</p>
        </div>
      </div>
    </div>

    {/* For Clients & Freelancers */}
    <div className="container" style={{ padding: "60px 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
        <div className="card">
          <h3 style={{ fontSize: "20px", marginBottom: "16px" }}>For Clients</h3>
          <ul style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: "2" }}>
            <li>✓ Post jobs and receive proposals</li>
            <li>✓ Browse freelancer gigs and services</li>
            <li>✓ Chat directly with freelancers</li>
            <li>✓ Hire the perfect match for your project</li>
          </ul>
          <a href="/register" style={{ display: "inline-block", marginTop: "20px" }}>
            <button className="btn btn-primary" style={{ fontSize: "13px" }}>Hire Talent →</button>
          </a>
        </div>
        <div className="card">
          <h3 style={{ fontSize: "20px", marginBottom: "16px" }}>For Freelancers</h3>
          <ul style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: "2" }}>
            <li>✓ Create gigs to showcase your skills</li>
            <li>✓ Browse and apply to job postings</li>
            <li>✓ Get hired by clients directly</li>
            <li>✓ Build your freelance career</li>
          </ul>
          <a href="/register" style={{ display: "inline-block", marginTop: "20px" }}>
            <button className="btn btn-outline" style={{ fontSize: "13px" }}>Find Work →</button>
          </a>
        </div>
      </div>
    </div>

    {/* How It Works */}
    <div style={{ borderTop: "1px solid var(--color-border)" }}>
      <div className="container" style={{ padding: "60px 24px" }}>
        <h2 style={{ fontSize: "24px", marginBottom: "40px" }}>How it works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "40px" }}>
          <div>
            <div style={{ width: "40px", height: "40px", border: "1px solid var(--color-border)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", fontSize: "16px" }}>1</div>
            <h4 style={{ fontSize: "16px", marginBottom: "8px" }}>Create your profile</h4>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: "1.6" }}>Sign up as a client to hire talent or as a freelancer to find work.</p>
          </div>
          <div>
            <div style={{ width: "40px", height: "40px", border: "1px solid var(--color-border)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", fontSize: "16px" }}>2</div>
            <h4 style={{ fontSize: "16px", marginBottom: "8px" }}>Post or browse</h4>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: "1.6" }}>Clients post jobs, freelancers create gigs. Browse and find the perfect match.</p>
          </div>
          <div>
            <div style={{ width: "40px", height: "40px", border: "1px solid var(--color-border)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", fontSize: "16px" }}>3</div>
            <h4 style={{ fontSize: "16px", marginBottom: "8px" }}>Connect & collaborate</h4>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: "1.6" }}>Chat in real-time, discuss project details, and start working together.</p>
          </div>
        </div>
      </div>
    </div>

    {/* CTA */}
    <div style={{ borderTop: "1px solid var(--color-border)" }}>
      <div className="container" style={{ padding: "60px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: "28px", marginBottom: "16px" }}>Ready to get started?</h2>
        <p style={{ fontSize: "16px", color: "var(--color-text-secondary)", marginBottom: "24px" }}>Join Smith Works and start connecting today</p>
        <a href="/register"><button className="btn btn-primary" style={{ padding: "14px 32px", fontSize: "15px" }}>Create Free Account</button></a>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <ToastContainer theme="dark" position="top-right" />
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
            </Routes>
          </div>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
