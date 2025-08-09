import React, { useState } from 'react';
import { buildApiUrl } from '../utils/api';
import './Register.css';

interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface RegisterResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    username: string;
    role: string;
  };
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    if (!formData.username || !formData.password) {
      return 'Username and password are required';
    }

    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    // Validate email only if provided
    if (formData.email && formData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        return 'Please enter a valid email address';
      }
    }

    if (formData.username.length < 3) {
      return 'Username must be at least 3 characters long';
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
      const response = await fetch(buildApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Registration failed: ${response.status}`);
      }

      const registerData = data as RegisterResponse;

      // Store the token and user info (automatically log them in)
      localStorage.setItem('adminToken', registerData.token);
      localStorage.setItem('adminUser', JSON.stringify(registerData.user));

      setSuccess(true);
      
      // Note: Removed auto-redirect, user will use Continue button

    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="register-container">
        <div className="register-form">
          <h2>Registration Successful!</h2>
          <p>Welcome! You're now logged in and ready to start creating your personal lists.</p>
          <div className="success-message">
            Account created successfully. You can now explore the site!
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="submit-button"
            style={{ marginTop: '1rem' }}
          >
            Continue to Home Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>Create Account</h2>
        <p>Join to create your own personal lists and rankings</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address (optional)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Choose a username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a password (min 6 characters)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
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
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="login-link">
          Already have an account? Use the "Login" button in the header above
        </div>
      </div>
    </div>
  );
};

export default Register;
