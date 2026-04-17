import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      return error;
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Art Side */}
      <div className="auth-art" style={{ background: 'var(--nb-electric-blue)' }}>
        <div className="auth-art-shapes">
          <div className="auth-shape" style={{ width: 200, height: 200, background: 'var(--nb-yellow)', top: '10%', left: '10%', transform: 'rotate(15deg)' }} />
          <div className="auth-shape" style={{ width: 150, height: 150, background: 'var(--nb-pink)', borderRadius: '50%', bottom: '15%', right: '15%' }} />
          <div className="auth-shape" style={{ width: 100, height: 100, background: 'var(--nb-lime)', top: '50%', left: '50%', transform: 'rotate(-10deg)' }} />
        </div>
        <div className="auth-art-title">
          Welcome<br/>Back<br/>
          <span style={{ color: 'var(--nb-yellow)' }}>★</span>
        </div>
        <div style={{ position: 'relative', zIndex: 2, marginTop: 24 }}>
          <div className="smiley" style={{ width: 100, height: 100 }}>
            <div className="smiley-eye smiley-eye-left" style={{ width: 12, height: 16 }} />
            <div className="smiley-eye smiley-eye-right" style={{ width: 12, height: 16 }} />
            <div className="smiley-mouth" style={{ width: 40, height: 20, borderWidth: 3 }} />
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="auth-form-side">
        <div className="card-static" style={{ width: "100%", maxWidth: 440 }}>
          <span className="badge badge-blue" style={{ marginBottom: 16 }}>
            Account Access
          </span>
          <h1 style={{ fontSize: 36, marginBottom: 8, fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
            Sign In
          </h1>
          <p style={{ color: "var(--nb-text-secondary)", marginBottom: 28, fontSize: 15 }}>
            Continue managing gigs, proposals, projects, and messages.
          </p>

          <form onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              id="login-email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              id="login-password"
              placeholder="your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <Button type="submit" style={{ width: "100%", marginTop: 8, padding: '14px 24px', fontSize: 15 }}>
              Sign In →
            </Button>
          </form>

          <p style={{ marginTop: 24, color: "var(--nb-text-secondary)", fontSize: 14 }}>
            No account yet?{" "}
            <Link to="/register" style={{ 
              color: "var(--nb-hot-pink)", 
              fontWeight: 700, 
              borderBottom: '2px solid var(--nb-hot-pink)' 
            }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
