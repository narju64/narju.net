import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface NavLink {
  href: string
  label: string
}

const navLinks: NavLink[] = [
  { href: '/music', label: 'Music' },
  { href: '/list', label: 'Lists' },
  { href: '/blog', label: 'Blog' },
  { href: '/books', label: 'Books' },
  { href: '/vinyl', label: 'Vinyl' },
  { href: '/OrbitalCalendar', label: 'Orbital Calendar' },
]

const Header: React.FC = () => {
  const location = useLocation();

  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-brand">
          <Link to="/" className="logo">narju.net</Link>
        </div>
        <div className="nav-links">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              to={link.href} 
              className={`nav-link ${location.pathname === link.href ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}

export default Header 