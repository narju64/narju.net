import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Hierarchical navigation structure
const navStructure = [
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
        { label: 'Echoes', href: '/projects/videogames/echoes' },
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
      { label: 'Diet', href: '/lifestyle/diet', children: [
        { label: 'Recipe collection', href: '/lifestyle/diet/recipe-collection' },
      ]},
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

const Header: React.FC = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: string | null }>({});
  const navRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Helper to check if a path is active or a parent of the current path
  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

  // Recursive dropdown rendering for desktop
  const renderDropdown = (items: any[], parentLabel: string, depth = 0, topLevelLabel?: string) => {
    const shouldOpenLeft = depth > 0 && ["Content", "Lifestyle", "Elsewhere"].includes(topLevelLabel || "");
    let style: React.CSSProperties = { position: 'absolute', zIndex: 1000 };
    if (depth === 0 && parentLabel === 'Elsewhere') {
      style = { ...style, top: '100%', left: -52, right: 'auto' };
    } else if (depth === 0) {
      style = { ...style, top: '100%', left: 0, right: 'auto' };
    } else if (shouldOpenLeft) {
      style = { ...style, top: 0, right: '100%', left: 'auto' };
    } else {
      style = { ...style, top: 0, left: '100%', right: 'auto' };
    }
    return (
      <ul className={`dropdown-menu depth-${depth}${shouldOpenLeft ? ' open-left' : ''}`} style={style}>
        {items.map((item) => (
          <li
            key={item.href}
            className={isActive(item.href) ? 'active' : ''}
            onMouseEnter={() => {
              setOpenSubmenus((prev) => ({ ...prev, [parentLabel]: item.label }));
            }}
            onMouseLeave={() => {
              setOpenSubmenus((prev) => ({ ...prev, [parentLabel]: null }));
            }}
            style={{ position: 'relative' }}
          >
            <Link to={item.href} onClick={() => setMobileOpen(false)}>{item.label}</Link>
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
          <Link to="/" className="logo">narju.net</Link>
        </div>
        <button className="nav-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          <span className="hamburger" />
        </button>
        <div className={`nav-links${mobileOpen ? ' open' : ''}`}>
          {navStructure.map((item) => (
            <div
              className={`nav-link${isActive(item.href) ? ' active' : ''}`}
              key={item.href}
              ref={el => { navRefs.current[item.label] = el; }}
              onMouseEnter={() => setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
              style={{ position: 'relative', display: 'inline-block' }}
            >
              <Link to={item.href} onClick={() => setMobileOpen(false)}>{item.label}</Link>
              {item.children && openDropdown === item.label && (
                <div className="dropdown-container">
                  {renderDropdown(item.children, item.label, 0, item.label)}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header; 