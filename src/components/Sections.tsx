import React from 'react'

interface SectionCard {
  href: string
  title: string
  description: string
}

const sections: SectionCard[] = [
  {
    href: '/music',
    title: 'Music',
    description: 'Discover my musical tastes, favorite artists, and playlists'
  },
  {
    href: '/list',
    title: 'Lists',
    description: 'Rankings and lists of rappers, NBA players, movies, and more'
  },
  {
    href: '/blog',
    title: 'Blog',
    description: 'Thoughts, ideas, and random musings'
  },
  {
    href: '/books',
    title: 'Books',
    description: 'What I\'m reading and book recommendations'
  },
  {
    href: '/vinyl',
    title: 'Vinyl',
    description: 'My vinyl collection and record reviews'
  }
]

const Sections: React.FC = () => {
  return (
    <section className="sections">
      <div className="container">
        <h2 className="section-title">Explore</h2>
        <div className="cards-grid">
          {sections.map((section) => (
            <a key={section.href} href={section.href} className="card">
              <h3 className="card-title">{section.title}</h3>
              <p className="card-description">{section.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Sections 