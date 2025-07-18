import React from 'react'
import './SportsLists.css'

interface SportsList {
  href: string
  title: string
  description: string
}

const sportsLists: SportsList[] = [
  {
    href: '/lists/sports/nba-player-rankings',
    title: 'NBA Player Rankings',
    description: 'The greatest basketball players of all time, ranked'
  },
  {
    href: '/lists/sports/nba-teams',
    title: 'NBA Teams',
    description: 'Favorite NBA teams and franchise rankings'
  },
  {
    href: '/lists/sports/other-sports',
    title: 'Other Sports',
    description: 'Rankings and favorites from other sports'
  }
]

const SportsLists: React.FC = () => {
  return (
    <div className="sports-lists-page">
      <div className="container">
        <h1 className="page-title">Sports Lists</h1>
        <p className="page-description">My sports rankings and favorites</p>
        
        <div className="lists-grid">
          {sportsLists.map((list) => (
            <a key={list.href} href={list.href} className="list-card">
              <h3 className="list-title">{list.title}</h3>
              <p className="list-description">{list.description}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SportsLists 