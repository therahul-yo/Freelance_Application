import { Link } from "react-router-dom";
import Button from "../components/Button";

const NotFound = () => (
  <div className="container page-section" style={{ textAlign: "center", paddingTop: 80, paddingBottom: 80 }}>
    <div style={{ fontSize: 80, marginBottom: 16 }}>🚧</div>
    <h1 style={{ fontSize: 64, fontFamily: "var(--font-display)", textTransform: "uppercase", marginBottom: 12 }}>
      404
    </h1>
    <p style={{ fontSize: 20, color: "var(--nb-text-secondary)", marginBottom: 32, maxWidth: 440, marginInline: "auto" }}>
      This page doesn't exist, was removed, or you don't have access.
    </p>
    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
      <Link to="/">
        <Button>← Back to Home</Button>
      </Link>
      <Link to="/dashboard">
        <Button variant="outline">Go to Dashboard</Button>
      </Link>
    </div>
  </div>
);

export default NotFound;
