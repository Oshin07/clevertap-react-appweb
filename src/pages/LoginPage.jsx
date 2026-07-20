import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isCleverTapInitialized } from '../services/clevertap';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const ctOn = isCleverTapInitialized();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    // --- Mock authentication ---
    // Replace this block with a real fetch() call to your auth backend.
    const user = { email: email.trim(), name: email.trim().split('@')[0] };

    login(user);            // 1. sets user state + 2. initializes CleverTap
    navigate(from, { replace: true }); // 3. THEN navigate to the dashboard page
  };

  return (
    <div className="login-screen">
      <div className="badge">
        <span className={`dot${ctOn ? ' on' : ''}`}></span>
        CleverTap: {ctOn ? 'initialized' : 'not initialized (waiting for login)'}
      </div>

      <div className="card">
        <div className="eyebrow">signalhouse</div>
        <h1 className="title">Sign in to begin tracking</h1>
        <p className="subtitle">
          Nothing gets sent to CleverTap until you're authenticated. This page has zero
          CleverTap code loaded until you submit the form below.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="field">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </label>
          <label className="field">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          {error && <div className="error">{error}</div>}

          <button type="submit" className="submit-btn">Sign in</button>
        </form>

        <p className="hint">Any email/password works — this is a mock auth flow for demo purposes.</p>
      </div>
    </div>
  );
}
