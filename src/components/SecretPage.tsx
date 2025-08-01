import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  verifyPassword, 
  storeEncryptedData, 
  getEncryptedData, 
  clearEncryptedData,
  RateLimiter 
} from '../utils/security';
import './SecretPage.css';

const SecretPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(true);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on the accounts page
  const isAccountsPage = location.pathname === '/najnimre/accounts';
  
  // Initialize rate limiter
  const rateLimiter = new RateLimiter();

  // Check if already authenticated (stored in sessionStorage)
  useEffect(() => {
    const authStatus = sessionStorage.getItem('secretAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      setShowPasswordPrompt(false);
    }
    
    // Check rate limiting status
    if (!rateLimiter.canAttempt()) {
      setIsLockedOut(true);
      setLockoutTime(rateLimiter.getLockoutTime());
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    if (!rateLimiter.canAttempt()) {
      setIsLockedOut(true);
      setLockoutTime(rateLimiter.getLockoutTime());
      setError('Too many attempts. Please wait before trying again.');
      return;
    }
    
    if (verifyPassword(password)) {
      setIsAuthenticated(true);
      setShowPasswordPrompt(false);
      setError('');
      setIsLockedOut(false);
      // Store authentication in sessionStorage
      sessionStorage.setItem('secretAuth', 'true');
      
      // Store some encrypted data for demonstration
      const accountData = {
        accounts: [
          { service: 'Email', username: 'your.email@example.com' },
          { service: 'GitHub', username: 'your-github-username' },
          { service: 'Discord', username: 'your-discord-username' }
        ]
      };
      storeEncryptedData('accounts', accountData);
    } else {
      rateLimiter.recordAttempt();
      setError('Incorrect password');
      setPassword('');
      
      if (!rateLimiter.canAttempt()) {
        setIsLockedOut(true);
        setLockoutTime(rateLimiter.getLockoutTime());
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowPasswordPrompt(true);
    setPassword('');
    setError('');
    setIsLockedOut(false);
    clearEncryptedData();
  };

  if (showPasswordPrompt) {
    return (
      <div className="secret-page">
        <div className="password-container">
          <div className="password-box">
            <h2>🔒 Secret Area</h2>
            <p>This area is password protected.</p>
            
            {isLockedOut ? (
              <div className="lockout-message">
                <p>Too many failed attempts. Please wait {Math.ceil(lockoutTime / 1000)} seconds before trying again.</p>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="password-form">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="password-input"
                  autoFocus
                  disabled={isLockedOut}
                />
                {error && <div className="error-message">{error}</div>}
                <button type="submit" className="password-button" disabled={isLockedOut}>
                  Access
                </button>
              </form>
            )}
            
            <button 
              onClick={() => navigate('/')} 
              className="back-button"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="secret-page">
      <div className="secret-header">
        <h1>🔐 Secret Area</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      
      <div className="secret-content">
        {isAccountsPage ? (
          <>
            <h2>Accounts Management</h2>
            <p>Manage your accounts and settings here.</p>
            
            <div className="secret-section">
              <h3>Account Settings</h3>
              <p>This is where you can manage:</p>
              <ul>
                <li>User profiles</li>
                <li>Security settings</li>
                <li>Account preferences</li>
                <li>Login credentials</li>
                <li>Privacy settings</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <h2>Welcome to the secret area!</h2>
            <p>This is your private space. Add whatever content you'd like here.</p>
            
            {/* Add your secret content here */}
            <div className="secret-section">
              <h3>Private Notes</h3>
              <p>This could be a place for:</p>
              <ul>
                <li>Personal notes</li>
                <li>Private projects</li>
                <li>Admin functions</li>
                <li>Hidden features</li>
                <li>Anything you want to keep private</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SecretPage; 