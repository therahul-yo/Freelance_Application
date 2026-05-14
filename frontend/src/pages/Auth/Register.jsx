import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("freelancer");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await register(name, email, password, role);
      navigate("/dashboard");
    } catch (error) {
      return error;
    }
  };

  return (
    <div className="auth-page auth-wrapper">
      {/* LEFT — ART PANEL (BLUE) */}
      <div className="auth-art" style={{ background: 'var(--blue)' }}>
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
            SECTION 02
          </div>
          <div className="auth-art-title">
            JOIN<br />
            THE<br />
            <span style={{ background: 'var(--yellow)', color: 'var(--ink)', padding: '0 16px', border: '6px solid var(--ink)', display: 'inline-block', lineHeight: 0.85 }}>
              CREW.
            </span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 380 }}>
          {[
            { num: '0', label: 'PLATFORM FEE' },
            { num: '∞', label: 'PROJECTS' },
            { num: '24/7', label: 'SUPPORT' },
            { num: '100%', label: 'YOURS' },
          ].map((stat) => (
            <div key={stat.label} style={{
              padding: 16,
              background: 'var(--ink)',
              border: '4px solid var(--ink)',
              boxShadow: '4px 4px 0 var(--yellow)',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--yellow)', lineHeight: 1 }}>
                {stat.num}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--white)', marginTop: 4 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — FORM PANEL */}
      <div className="auth-form-side">
        <div style={{ maxWidth: 520, width: '100%' }}>
          <Link to="/" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            letterSpacing: 1.5,
            display: 'inline-flex',
            alignItems: 'center',
            marginBottom: 32,
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
              color: 'var(--red)',
              marginBottom: 12,
            }}>
              MARKETPLACE SIGNUP
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, lineHeight: 0.9, textTransform: 'uppercase', marginBottom: 12 }}>
              CREATE ACCOUNT
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--muted)', marginBottom: 32, fontSize: 15, fontStyle: 'italic' }}>
              Join as a client to hire or as a freelancer to publish services and pitch live work.
            </p>

            <form onSubmit={handleSubmit}>
              <Input label="Full Name" id="register-name" placeholder="Rahul Sharma" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Email" type="email" id="register-email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Password" type="password" id="register-password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required />

              <div style={{ marginBottom: 24 }}>
                <label className="input-label">Account Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { value: 'freelancer', title: 'FREELANCER', body: 'Create gigs & pitch projects' },
                    { value: 'client', title: 'CLIENT', body: 'Post projects & hire talent' },
                  ].map((opt) => {
                    const active = role === opt.value;
                    return (
                      <div
                        key={opt.value}
                        role="button"
                        tabIndex={0}
                        onClick={() => setRole(opt.value)}
                        onKeyDown={(e) => e.key === 'Enter' && setRole(opt.value)}
                        style={{
                          padding: 18,
                          border: '4px solid var(--ink)',
                          background: active ? 'var(--yellow)' : 'var(--white)',
                          boxShadow: active ? '6px 6px 0 var(--ink)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.12s',
                          transform: active ? 'translate(-2px, -2px)' : 'none',
                          position: 'relative',
                        }}
                      >
                        {active && (
                          <div style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            width: 20,
                            height: 20,
                            border: '3px solid var(--ink)',
                            background: 'var(--ink)',
                            color: 'var(--yellow)',
                            display: 'grid',
                            placeItems: 'center',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            fontSize: 12,
                            lineHeight: 1,
                          }}>✓</div>
                        )}
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1, marginBottom: 6 }}>
                          {opt.title}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: active ? 'var(--ink)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {opt.body}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button type="submit" size="lg" style={{ width: '100%' }}>
                Create Account →
              </Button>
            </form>

            <p style={{ marginTop: 28, color: 'var(--muted)', fontSize: 14, fontFamily: 'var(--font-body)' }}>
              Already registered?{' '}
              <Link to="/login" style={{
                color: 'var(--blue)',
                fontWeight: 700,
                borderBottom: '3px solid var(--blue)',
                paddingBottom: 1,
              }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
