import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Login.css';

interface LoginFormData {
  emailOrUsername: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    username: string;
    role: string;
  };
  error?: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    emailOrUsername: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.emailOrUsername || !formData.password) {
      return 'Email/Username and password are required';
    }

    if (formData.password.length < 1) {
      return 'Password is required';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.emailOrUsername,
          password: formData.password
        })
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Login failed: ${response.status}`);
      }

      // Store user data and token using auth context
      login(data.user, data.token);

      // Redirect to routine page or home
      navigate('/lifestyle/routine');
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        <div className="login-form-group">
          <label htmlFor="emailOrUsername" className="login-form-label">Email or Username</label>
          <input
            type="text"
            id="emailOrUsername"
            name="emailOrUsername"
            value={formData.emailOrUsername}
            onChange={handleInputChange}
            className="login-form-input"
            placeholder="Enter your email or username"
            required
          />
        </div>

        <div className="login-form-group">
          <label htmlFor="password" className="login-form-label">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="login-form-input"
            placeholder="Enter your password"
            required
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading} 
          className="login-form-submit"
          onClick={handleSubmit}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        


        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <a href="/register" className="register-link">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
