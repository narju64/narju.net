import React from 'react';
import './FavoriteAlbums.css';
import { buildApiUrl } from '../utils/api';

interface Album {
  id: number
  rank: number
  title: string
  artist: string
  year: number
  genre: string
  display_genre: string
  categories: string[]
  cover_image: string
  description?: string
  favorite_tracks?: string[]
  spotify_album_id?: string
  youtube_playlist_id?: string
  youtube_music_id?: string
  personal_notes?: string
  created_at?: string
  updated_at?: string
}

interface ApiResponse {
  albums: Album[];
}

const FavoriteAlbums: React.FC = () => {
  const [expandedAlbum, setExpandedAlbum] = React.useState<number | null>(null)
  const [selectedGenre, setSelectedGenre] = React.useState<string>('All')
  const [selectedDecade, setSelectedDecade] = React.useState<string>('All')
  const [sortBy, setSortBy] = React.useState<'rank' | 'year' | 'title' | 'artist'>('rank')
  const [albums, setAlbums] = React.useState<Album[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)

  // Check if user is logged in
  React.useEffect(() => {
    const storedUser = localStorage.getItem('adminUser')
    const storedToken = localStorage.getItem('adminToken')
    const loggedIn = !!(storedUser && storedToken)
    setIsLoggedIn(loggedIn)

    // If logged in, fetch from API
    if (loggedIn) {
      fetchAlbumsFromApi()
    }
  }, [])

  const fetchAlbumsFromApi = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const storedToken = localStorage.getItem('adminToken')
      if (!storedToken) {
        throw new Error('No authentication token found')
      }
      
      const response = await fetch(buildApiUrl('/api/albums'), {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: ApiResponse = await response.json()
      
      // Use API data if available
      if (data.albums && data.albums.length > 0) {
        setAlbums(data.albums)
      } else {
        setError('No albums data available')
      }
    } catch (err) {
      console.error('Error fetching albums from API:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Get unique genres and decades from current albums
  const genres = ['All', ...Array.from(new Set(albums.map(album => album.genre).filter(genre => genre !== 'Unknown')))]
  const decades = ['All', ...Array.from(new Set(albums.map(album => Math.floor(album.year / 10) * 10).sort()))]

  // Filter and sort albums
  const filteredAlbums = albums
    .filter(album => {
      const genreMatch = selectedGenre === 'All' || album.genre === selectedGenre
      const decadeMatch = selectedDecade === 'All' || Math.floor(album.year / 10) * 10 === parseInt(selectedDecade)
      return genreMatch && decadeMatch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'year':
          return a.year - b.year
        case 'title':
          return a.title.localeCompare(b.title)
        case 'artist':
          return a.artist.localeCompare(b.artist)
        default:
          return a.rank - b.rank
      }
    })

  // Show login required message if not logged in
  if (!isLoggedIn) {
    return (
      <div className="favorite-albums-page">
        <div className="container">
          <h1 className="page-title">Top Albums</h1>
          <p className="page-description">Please log in to view the album collection.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="favorite-albums-page">
      <div className="container">
        <h1 className="page-title">Top Albums</h1>
        <p className="page-description">
          My personal collection of favorite albums
          {loading && (
            <span style={{ color: '#e67e22', fontWeight: 'bold' }}>
              {' '}(Loading from database)
            </span>
          )}
        </p>
        
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#e67e22' }}>
            Loading albums from database...
          </div>
        )}
        
        {error && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#e53e3e' }}>
            Error loading from database: {error}. Using hardcoded data.
          </div>
        )}
        
        {/* Filter and Sort Controls */}
        <div className="filter-controls">
          <div className="filter-group">
            <label>Genre:</label>
            <select 
              value={selectedGenre} 
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="filter-select"
            >
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Decade:</label>
            <select 
              value={selectedDecade} 
              onChange={(e) => setSelectedDecade(e.target.value)}
              className="filter-select"
            >
              {decades.map(decade => (
                <option key={decade} value={decade}>{decade}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as 'rank' | 'year' | 'title' | 'artist')}
              className="filter-select"
            >
              <option value="rank">Rank</option>
              <option value="year">Year</option>
              <option value="title">Title</option>
              <option value="artist">Artist</option>
            </select>
          </div>
          
          <div className="filter-stats">
            Showing {filteredAlbums.length} of {albums.length} albums
          </div>
        </div>
        
        <div className="albums-list">
          {filteredAlbums.map((album) => {
            const isExpanded = expandedAlbum === album.id
            const isLastInRow = album.rank % 5 === 0
            const isSecondToLastInRow = album.rank % 5 === 4
            
            return (
              <div 
                key={album.id} 
                className={`album-item ${isExpanded ? 'expanded' : ''} ${isExpanded ? (isLastInRow || isSecondToLastInRow ? 'expand-left' : 'expand-right') : ''}`}
                onClick={() => setExpandedAlbum(isExpanded ? null : album.id)}
              >
                <div className="album-rank">#{album.rank}</div>
                
                <div className="album-cover">
                  <img 
                    src={album.cover_image} 
                    alt={`${album.title} by ${album.artist}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="album-cover-placeholder hidden">
                    <div className="placeholder-icon">🎵</div>
                    <div className="placeholder-text">No Cover</div>
                  </div>
                </div>
                
                <div className="album-info">
                  <h3 className="album-title">{album.title}</h3>
                  <p className="album-artist">{album.artist}</p>
                  <p className="album-year">{album.year}</p>
                  <p className="album-genre">{album.display_genre}</p>
                  
                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="album-expanded-content">

                      
                      {album.favorite_tracks && album.favorite_tracks.length > 0 && (
                        <div className="favorite-tracks">
                          <h4>Favorite Tracks</h4>
                          <ul>
                            {album.favorite_tracks.map((track, index) => (
                              <li key={index}>{track}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="music-embed">
                        <h4>Listen to Album</h4>
                        {album.youtube_music_id ? (
                          <div className="youtube-player">
                            <iframe
                              style={{ borderRadius: '12px' }}
                              src={`https://www.youtube.com/embed/${album.youtube_music_id}?autoplay=0&modestbranding=1&rel=0`}
                              width="100%"
                              height="315"
                              frameBorder="0"
                              allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              loading="lazy"
                            ></iframe>
                          </div>
                        ) : album.youtube_playlist_id && album.youtube_playlist_id !== "" ? (
                          <div className="youtube-player">
                            <iframe
                              style={{ borderRadius: '12px' }}
                              src={`https://www.youtube.com/embed/videoseries?list=${album.youtube_playlist_id}&autoplay=0`}
                              width="100%"
                              height="315"
                              frameBorder="0"
                              allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              loading="lazy"
                            ></iframe>
                          </div>
                        ) : album.spotify_album_id ? (
                          <div className="spotify-player">
                            <iframe
                              style={{ borderRadius: '12px' }}
                              src={`https://open.spotify.com/embed/album/${album.spotify_album_id}`}
                              width="100%"
                              height="352"
                              frameBorder="0"
                              allowFullScreen
                              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                              loading="lazy"
                            ></iframe>
                          </div>
                        ) : (
                          <div className="music-placeholder">
                            <p>No music player available</p>
                            <p className="music-help">Add YouTube Music or Spotify album ID to enable playback</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="album-actions">
                        {album.spotify_album_id && (
                          <button 
                            className="spotify-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Create a hidden link element to trigger the app protocol
                              const link = document.createElement('a')
                              link.href = `spotify:album:${album.spotify_album_id}`
                              link.style.display = 'none'
                              document.body.appendChild(link)
                              link.click()
                              document.body.removeChild(link)
                              
                              // Fallback to web version after a delay
                              setTimeout(() => {
                                window.open(`https://open.spotify.com/album/${album.spotify_album_id}`, '_blank')
                              }, 500)
                            }}
                          >
                            <span>♫</span> Open in Spotify
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="add-album-section">
          <h2>Add New Album</h2>
          <p>Want to add more albums to this list? You can edit the data in the component file.</p>
        </div>
      </div>
    </div>
  )
}

export default FavoriteAlbums