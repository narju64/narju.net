import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SiteToggle } from '../npa-translator/components/SiteToggle';
import { usePhoneticContext } from '../npa-translator/context/PhoneticContext';
import { buildApiUrl } from '../utils/api';

// Normal navigation structure
const normalNavStructure = [
  {
    label: 'Creative Works',
    href: '/creative',
    children: [
      { label: 'Music', href: '/creative/music', children: [
        { label: 'Beats', href: '/creative/music/beats' },
        { label: 'Guitar', href: '/creative/music/guitar' },
        { label: 'Hip-hop', href: '/creative/music/hiphop' },
      ]},
      { label: 'Visual Art', href: '/creative/visual-art', children: [
        { label: 'Digital art', href: '/creative/visual-art/digital' },
        { label: 'Traditional media', href: '/creative/visual-art/traditional' },
        { label: 'Photography', href: '/creative/visual-art/photography' },
      ]},
      { label: 'Video Content', href: '/creative/video-content' },
    ],
  },
  {
    label: 'Collections',
    href: '/collections',
    children: [
      { label: 'Vinyl', href: '/collections/vinyl' },
      { label: 'Books', href: '/collections/books' },
      { label: 'Trading Cards', href: '/collections/trading-cards' },
    ],
  },
  {
    label: 'Lists',
    href: '/lists',
    children: [
      { label: 'Music', href: '/lists/music', children: [
        { label: 'Top artists', href: '/lists/music/top-artists' },
        { label: 'Favorite albums', href: '/lists/music/favorite-albums' },
        { label: 'Best Hip-hop Albums', href: '/lists/music/best-hiphop-albums' },
      ]},
      { label: 'Sports', href: '/lists/sports', children: [
        { label: 'NBA player rankings', href: '/lists/sports/nba-player-rankings' },
        { label: 'All-time Athletes', href: '/lists/sports/all-time-athletes' },
      ]},
      { label: 'Film & TV', href: '/lists/film-tv', children: [
        { label: 'Top movies', href: '/lists/film-tv/top-movies' },
        { label: 'TV show rankings', href: '/lists/film-tv/tv-show-rankings' },
      ]},
      { label: 'Influences', href: '/lists/influences', children: [
        { label: 'Philosophy', href: '/lists/influences/philosophy' },
        { label: 'Podcasters', href: '/lists/influences/podcasters' },
      ]},
    ],
  },
  {
    label: 'Projects',
    href: '/projects',
    children: [
      { label: 'Videogames', href: '/projects/videogames', children: [
        { label: 'Echoes', href: 'https://echoes.narju.net' },
      ]},
      { label: 'Orbital Calendar', href: '/projects/orbital-calendar' },
      { label: 'Phonetic Alphabet', href: '/projects/phonetic-alphabet' },
      { label: 'Conlang', href: '/projects/conlang' },
      { label: 'Chess Repertoire Tool (future)', href: '/projects/chess-repertoire-tool' },
    ],
  },
  {
    label: 'Content',
    href: '/content',
    children: [
      { label: 'Personal Docs', href: '/content/personal-docs', children: [
        { label: 'Speedcube algorithm', href: '/content/personal-docs/speedcube-algorithm' },
        { label: 'Prayer', href: '/content/personal-docs/prayer' },
      ]},
      { label: 'Curated Media', href: '/content/curated-media', children: [
        { label: 'Podcasts', href: '/content/curated-media/podcasts' },
        { label: 'YouTube videos', href: '/content/curated-media/youtube-videos' },
        { label: 'Memes', href: '/content/curated-media/memes' },
        { label: 'Articles', href: '/content/curated-media/articles' },
      ]},
    ],
  },
  {
    label: 'Lifestyle',
    href: '/lifestyle',
    children: [
      { label: 'Routine', href: '/lifestyle/routine' },
      { label: 'Exercise', href: '/lifestyle/exercise' },
      { label: 'Diet', href: '/lifestyle/diet' },
      { label: 'Adventure', href: '/lifestyle/adventure', children: [
        { label: 'Car living', href: '/lifestyle/adventure/car-living' },
        { label: 'Hiking', href: '/lifestyle/adventure/hiking' },
        { label: 'Land & house', href: '/lifestyle/adventure/land-house' },
      ]},
    ],
  },
  {
    label: 'Elsewhere',
    href: '/elsewhere',
    children: [
      { label: 'Music Profiles', href: '/elsewhere/music-profiles' },
      { label: 'Social Media', href: '/elsewhere/social-media' },
      { label: 'Professional', href: '/elsewhere/professional' },
      { label: 'Gaming', href: '/elsewhere/gaming' },
      { label: 'Software', href: '/elsewhere/software' },
    ],
  },
];

// Secret page navigation structure
const secretNavStructure = [
  {
    label: 'Accounts',
    href: '/najnimre/accounts',
    children: []
  },
];

const Header: React.FC = () => {
  const location = useLocation();
  const { isNPAMode, translateText } = usePhoneticContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: string | null }>({});
  const [translatedNavStructure, setTranslatedNavStructure] = useState(normalNavStructure);
  const navRefs = useRef<{ [key: string]: HTMLAnchorElement | HTMLButtonElement | null }>({});
  
  // Authentication state
  const [user, setUser] = useState<{ id: number; email: string; username: string; role: string } | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Check if user is already logged in on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('adminUser');
    const storedToken = localStorage.getItem('adminToken');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        // Clear invalid stored data
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
  }, []);

  // Helper to check if a path is active or a parent of the current path
  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

  // Determine which navigation structure to use based on current route
  const isSecretPage = location.pathname === '/najnimre' || location.pathname.startsWith('/najnimre/');
  const baseNavStructure = isSecretPage ? secretNavStructure : normalNavStructure;

  // Recursively translate navigation structure
  const translateNavItem = async (item: any): Promise<any> => {
    // Check if the label is already in nPA format (contains nPA characters)
    const npaChars = /[ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz]/;
    const isAlreadyNPA = npaChars.test(item.label) && !item.label.includes(' ');
    
    let translatedLabel;
    if (isAlreadyNPA) {
      // Skip translation if already in nPA format
      translatedLabel = item.label;
    } else {
      translatedLabel = await translateText(item.label);
    }
    
    const translatedItem = { ...item, label: translatedLabel };
    
    if (item.children) {
      const translatedChildren = await Promise.all(item.children.map(translateNavItem));
      translatedItem.children = translatedChildren;
    }
    
    return translatedItem;
  };

  // Update translated navigation structure when nPA mode changes
  useEffect(() => {
    const updateNavStructure = async () => {
      if (isNPAMode) {
        const translated = await Promise.all(baseNavStructure.map(translateNavItem));
        setTranslatedNavStructure(translated);
      } else {
        setTranslatedNavStructure(baseNavStructure);
      }
    };

    updateNavStructure();
  }, [isNPAMode, translateText, baseNavStructure]);

  const currentNavStructure = isNPAMode ? translatedNavStructure : baseNavStructure;

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        setShowLoginForm(false);
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Network error - check if backend is accessible at https://narjunet-production.up.railway.app');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setShowLoginForm(false);
  };

  // Recursive dropdown rendering for desktop
  const renderDropdown = (items: any[], parentLabel: string, depth = 0, topLevelLabel?: string) => {
    const isMobile = window.innerWidth <= 900;
    const shouldOpenLeft = !isMobile && depth > 0 && ["Content", "Lifestyle", "Elsewhere"].includes(topLevelLabel || "");
    
    let style: React.CSSProperties = { position: 'absolute', zIndex: 1000 };
    
    if (isMobile) {
      // Mobile: Simple vertical stacking, all dropdowns open the same way
      if (depth === 0) {
        style = { ...style, top: '100%', left: 0, right: 'auto' };
      } else {
        style = { ...style, top: 0, left: '100%', right: 'auto' };
      }
    } else {
      // Desktop: Complex directional logic for horizontal layout
      if (depth === 0 && parentLabel === 'Elsewhere') {
        style = { ...style, top: '100%', left: -52, right: 'auto' };
      } else if (depth === 0) {
        style = { ...style, top: '100%', left: 0, right: 'auto' };
      } else if (shouldOpenLeft) {
        style = { ...style, top: 0, right: '100%', left: 'auto' };
      } else {
        style = { ...style, top: 0, left: '100%', right: 'auto' };
      }
    }
    
    return (
      <ul className={`dropdown-menu depth-${depth}${shouldOpenLeft ? ' open-left' : ''}`} style={style}>
        {items.map((item) => (
          <li
            key={item.href}
            className={isActive(item.href) ? 'active' : ''}
            onMouseEnter={() => {
              // Only handle hover on desktop (non-mobile)
              if (window.innerWidth > 900) {
                setOpenSubmenus((prev) => ({ ...prev, [parentLabel]: item.label }));
              }
            }}
            onMouseLeave={() => {
              // Only handle hover on desktop (non-mobile)
              if (window.innerWidth > 900) {
                setOpenSubmenus((prev) => ({ ...prev, [parentLabel]: null }));
              }
            }}
          >
            {item.href.startsWith('http') ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ) : (
              <Link
                to={item.href}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            )}
            {item.children && openSubmenus[parentLabel] === item.label && (
              renderDropdown(item.children, item.label, depth + 1, topLevelLabel)
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-brand">
          <Link to="/" className="logo" onClick={() => setMobileOpen(false)}>
            <img src="/favicon.png" alt="narju.net" className="logo-icon" />
            narju.net
          </Link>
        </div>
        <button className="nav-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          <span className="hamburger" />
        </button>
        <div className={`nav-links${mobileOpen ? ' open' : ''}`}>
          {currentNavStructure.map((item) => (
            item.href.startsWith('http') ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className={`nav-link${isActive(item.href) ? ' active' : ''}`}
                key={item.href}
                ref={el => { navRefs.current[item.label] = el; }}
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
                style={{ position: 'relative', display: 'inline-block' }}
              >
                {item.label}
                {item.children && openDropdown === item.label && (
                  <div className="dropdown-container">
                    {renderDropdown(item.children, item.label, 0, item.label)}
                  </div>
                )}
              </a>
            ) : item.children ? (
              // If item has children, handle mobile click to expand
              <button
                className={`nav-link${isActive(item.href) ? ' active' : ''}`}
                key={item.href}
                ref={el => { navRefs.current[item.label] = el; }}
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // On mobile, toggle the dropdown instead of navigating
                  if (window.innerWidth <= 900) {
                    setOpenDropdown(openDropdown === item.label ? null : item.label);
                  }
                  // On desktop, do nothing - let hover handle it
                }}
                style={{ position: 'relative', display: 'inline-block' }}
              >
                {item.label}
                {item.children && openDropdown === item.label && (
                  <div className="dropdown-container">
                    {renderDropdown(item.children, item.label, 0, item.label)}
                  </div>
                )}
              </button>
            ) : (
              <Link
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`nav-link${isActive(item.href) ? ' active' : ''}`}
                key={item.href}
                ref={el => { navRefs.current[item.label] = el; }}
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
                style={{ position: 'relative', display: 'inline-block' }}
              >
                {item.label}
                {item.children && openDropdown === item.label && (
                  <div className="dropdown-container">
                    {renderDropdown(item.children, item.label, 0, item.label)}
                  </div>
                )}
              </Link>
            )
          ))}
        </div>
        
        {/* User Account Section */}
        <div className="user-account-section">
          {user ? (
            <div className="user-info">
              <span className="username">{user.username}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="login-section">
              {showLoginForm ? (
                <form onSubmit={handleLogin} className="login-form">
                  <input
                    type="text"
                    placeholder="Email or Username"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="login-input"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="login-input"
                  />
                  <button type="submit" disabled={isLoggingIn} className="login-btn">
                    {isLoggingIn ? 'Logging in...' : 'Login'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowLoginForm(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <Link 
                    to="/register" 
                    className="register-link"
                    onClick={() => setShowLoginForm(false)}
                  >
                    Create Account
                  </Link>
                  {loginError && <div className="login-error">{loginError}</div>}
                </form>
              ) : (
                <button 
                  onClick={() => setShowLoginForm(true)}
                  className="login-toggle-btn"
                >
                  Login
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="npa-toggle-container">
          <SiteToggle />
        </div>
      </nav>
    </header>
  );
};

export default Header; 