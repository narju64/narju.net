import React, { useState } from 'react';
import { buildApiUrl } from '../utils/api';
import './AdminLogin.css';

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    username: string;
    role: string;
  };
}

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setUser(data.user);
        // Store the token in localStorage for future use
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error - make sure the backend is running');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSuccess('');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  // Check if user is already logged in
  React.useEffect(() => {
    const storedUser = localStorage.getItem('adminUser');
    const storedToken = localStorage.getItem('adminToken');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setSuccess('Already logged in');
      } catch (error) {
        // Clear invalid stored data
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
  }, []);

  return (
    <div className="admin-login-page">
      <div className="container">
        <h1 className="page-title">Admin Login</h1>
        <p className="page-description">Test the authentication system</p>
        
        {!user ? (
          <div className="login-form-container">
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@narju.net"
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  required
                  className="form-input"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="login-button"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
          </div>
        ) : (
          <div className="user-info">
            <h2>Welcome, {user.username}!</h2>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            <p>User ID: {user.id}</p>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
