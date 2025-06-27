import React from 'react'

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
]

const Header: React.FC = () => {
  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-brand">
          <a href="/" className="logo">narju.net</a>
        </div>
        <div className="nav-links">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  )
}

export default Header 