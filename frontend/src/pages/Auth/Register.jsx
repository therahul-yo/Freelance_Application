import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('freelancer');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (error) {
      // Error handled by AuthContext toast
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <h1 style={{ marginBottom: '8px', fontSize: '24px' }}>Create account</h1>
        <p style={{ marginBottom: '32px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          Get started with FreelancePro
        </p>
        
        <form onSubmit={handleSubmit}>
          <Input 
            label="Full Name" 
            type="text" 
            id="name" 
            placeholder="John Doe"
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
          <Input 
            label="Email" 
            type="email" 
            id="email" 
            placeholder="you@example.com"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            id="password" 
            placeholder="••••••••"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              I want to
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setRole('freelancer')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: role === 'freelancer' ? 'var(--color-text-primary)' : 'transparent',
                  color: role === 'freelancer' ? 'var(--color-bg-primary)' : 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Find Work
              </button>
              <button
                type="button"
                onClick={() => setRole('client')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: role === 'client' ? 'var(--color-text-primary)' : 'transparent',
                  color: role === 'client' ? 'var(--color-bg-primary)' : 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Hire Talent
              </button>
            </div>
          </div>

          <Button type="submit" style={{ width: '100%' }}>
            Create Account
          </Button>
        </form>
        
        <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--color-text-primary)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
