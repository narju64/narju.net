import React from 'react'
import './Lists.css'

interface ListCategory {
  href: string
  title: string
  description: string
}

const listCategories: ListCategory[] = [
  {
    href: '/lists/music',
    title: 'Music',
    description: 'Favorite albums, artists, and songs'
  },
  {
    href: '/lists/movies',
    title: 'Movies',
    description: 'Top films and movie rankings'
  },
  {
    href: '/lists/books',
    title: 'Books',
    description: 'Favorite books and reading lists'
  },
  {
    href: '/lists/sports',
    title: 'Sports',
    description: 'NBA players, teams, and sports rankings'
  }
]

const Lists: React.FC = () => {
  return (
    <div className="lists-page">
      <div className="container">
        <h1 className="page-title">Lists</h1>
        <p className="page-description">Curated rankings and collections of my favorites</p>
        
        <div className="categories-grid">
          {listCategories.map((category) => (
            <a key={category.href} href={category.href} className="category-card">
              <h3 className="category-title">{category.title}</h3>
              <p className="category-description">{category.description}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Lists 