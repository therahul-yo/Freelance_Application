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
    <div className="auth-page auth-wrapper">
      {/* LEFT — ART PANEL */}
      <div className="auth-art" style={{ background: 'var(--ink)' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 2,
            color: 'var(--yellow)',
            marginBottom: 32,
            display: 'flex',
            gap: 12,
            alignItems: 'center',
          }}>
            <span style={{ width: 32, height: 3, background: 'var(--yellow)' }} />
            SECTION 01
          </div>
          <div className="auth-art-title">
            SIGN<br />IN.
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>
          {['FREE TO JOIN', 'ZERO FEES', 'REAL PROJECTS'].map((pill) => (
            <div key={pill} style={{
              display: 'inline-flex',
              padding: '8px 14px',
              background: 'var(--yellow)',
              color: 'var(--ink)',
              border: '3px solid var(--yellow)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              width: 'fit-content',
              boxShadow: '4px 4px 0 var(--yellow)',
            }}>
              ☆ {pill}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — FORM PANEL */}
      <div className="auth-form-side">
        <div style={{ maxWidth: 460, width: '100%' }}>
          <Link to="/" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            letterSpacing: 1.5,
            display: 'inline-flex',
            alignItems: 'center',
            marginBottom: 48,
          }}>
            SMITH<span style={{ background: 'var(--yellow)', color: 'var(--ink)', padding: '0 8px', marginLeft: 6, border: '3px solid var(--ink)' }}>WORKS</span>
          </Link>

          <div className="card-static" style={{ padding: 40 }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 2,
              color: 'var(--blue)',
              marginBottom: 12,
            }}>
              ACCOUNT ACCESS
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 56, lineHeight: 0.9, textTransform: 'uppercase', marginBottom: 12 }}>
              SIGN IN
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--muted)', marginBottom: 32, fontSize: 15, fontStyle: 'italic' }}>
              Continue managing gigs, proposals, projects, and messages.
            </p>

            <form onSubmit={handleSubmit}>
              <Input
                label="Email"
                type="email"
                id="login-email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                id="login-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" size="lg" style={{ width: '100%', marginTop: 8 }}>
                Sign In →
              </Button>
            </form>

            <p style={{ marginTop: 28, color: 'var(--muted)', fontSize: 14, fontFamily: 'var(--font-body)' }}>
              No account yet?{' '}
              <Link to="/register" style={{
                color: 'var(--blue)',
                fontWeight: 700,
                borderBottom: '3px solid var(--blue)',
                paddingBottom: 1,
              }}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
