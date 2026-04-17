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
    <div className="auth-wrapper">
      {/* Art Side */}
      <div className="auth-art" style={{ background: 'var(--nb-hot-pink)' }}>
        <div className="auth-art-shapes">
          <div className="auth-shape" style={{ width: 180, height: 180, background: 'var(--nb-yellow)', top: '5%', right: '5%', transform: 'rotate(-12deg)' }} />
          <div className="auth-shape" style={{ width: 120, height: 120, background: 'var(--nb-blue)', borderRadius: '50%', bottom: '20%', left: '10%' }} />
          <div className="auth-shape" style={{ width: 90, height: 90, background: 'var(--nb-purple)', top: '60%', right: '20%', transform: 'rotate(20deg)' }} />
          <div className="auth-shape" style={{ width: 60, height: 60, background: 'var(--nb-lime)', top: '30%', left: '20%', transform: 'rotate(45deg)' }} />
        </div>
        <div className="auth-art-title">
          Join<br/>The<br/>
          <span style={{ 
            background: 'var(--nb-yellow)', 
            color: 'var(--nb-black)', 
            padding: '0 12px',
            border: '3px solid var(--nb-black)',
          }}>
            Club
          </span>
        </div>
        <div style={{ position: 'relative', zIndex: 2, marginTop: 24, display: 'flex', gap: 16 }}>
          <span className="sticker sticker-2" style={{ fontSize: 11 }}>Free to join</span>
          <span className="sticker sticker-3" style={{ fontSize: 11 }}>No hidden fees</span>
        </div>
      </div>

      {/* Form Side */}
      <div className="auth-form-side">
        <div className="card-static" style={{ width: "100%", maxWidth: 500 }}>
          <span className="badge badge-pink" style={{ marginBottom: 16 }}>
            Marketplace Signup
          </span>
          <h1 style={{ fontSize: 34, marginBottom: 8, fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
            Create Account
          </h1>
          <p style={{ color: "var(--nb-text-secondary)", marginBottom: 28, fontSize: 15 }}>
            Join as a client to hire or as a freelancer to publish services and pitch live work.
          </p>

          <form onSubmit={handleSubmit}>
            <Input
              label="Full name"
              type="text"
              id="register-name"
              placeholder="Rahul Sharma"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              id="register-email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              id="register-password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: "block", 
                marginBottom: 10,
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 13,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Account type
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { value: "freelancer", icon: "⚡", title: "Freelancer", body: "Create gigs & send proposals" },
                  { value: "client", icon: "👤", title: "Client", body: "Post projects & hire talent" },
                ].map((option) => {
                  const active = role === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value)}
                      className={`card-static role-option ${active ? 'active' : ''}`}
                      style={{
                        textAlign: "left",
                        cursor: 'pointer',
                        padding: '18px',
                        background: active ? 'var(--nb-lavender)' : 'var(--nb-white)',
                      }}
                    >
                      <div style={{ fontSize: 26, marginBottom: 8 }}>{option.icon}</div>
                      <p style={{ fontWeight: 800, marginBottom: 4, fontSize: 16 }}>{option.title}</p>
                      <p style={{ color: "var(--nb-text-secondary)", fontSize: 13 }}>{option.body}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button type="submit" style={{ width: "100%", padding: '14px 24px', fontSize: 15 }}>
              Create Account →
            </Button>
          </form>

          <p style={{ marginTop: 24, color: "var(--nb-text-secondary)", fontSize: 14 }}>
            Already registered?{" "}
            <Link to="/login" style={{ 
              color: "var(--nb-hot-pink)", 
              fontWeight: 700,
              borderBottom: '2px solid var(--nb-hot-pink)' 
            }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
