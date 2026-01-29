import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
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
        <h1 style={{ marginBottom: '8px', fontSize: '24px' }}>Welcome back</h1>
        <p style={{ marginBottom: '32px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          Sign in to your account
        </p>
        
        <form onSubmit={handleSubmit}>
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
          
          <Button type="submit" style={{ width: '100%', marginTop: '8px' }}>
            Sign In
          </Button>
        </form>
        
        <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--color-text-primary)' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
