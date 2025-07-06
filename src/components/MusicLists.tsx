import React from 'react'
import './MusicLists.css'

interface MusicList {
  href: string
  title: string
  description: string
}

const musicLists: MusicList[] = [
  {
    href: '/lists/music/favorite-albums',
    title: 'Favorite Albums',
    description: 'My top albums of all time, ranked and reviewed'
  },
  {
    href: '/lists/music/favorite-artists',
    title: 'Favorite Artists',
    description: 'The musicians and bands that have shaped my taste'
  },
  {
    href: '/lists/music/favorite-songs',
    title: 'Favorite Songs',
    description: 'Individual tracks that I can\'t stop listening to'
  },
  {
    href: '/lists/music/playlists',
    title: 'Playlists',
    description: 'Curated collections for different moods and occasions'
  }
]

const MusicLists: React.FC = () => {
  return (
    <div className="music-lists-page">
      <div className="container">
        <h1 className="page-title">Music Lists</h1>
        <p className="page-description">My musical taste, organized and ranked</p>
        
        <div className="lists-grid">
          {musicLists.map((list) => (
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

export default MusicLists 