import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './FavoriteAlbums.css';
import { buildApiUrl } from '../utils/api';

// Sortable album item component with mobile support
const SortableAlbumItem: React.FC<{ 
  album: Album; 
  isMobile: boolean; 
  isEditingRank: boolean;
  newRankValue: string;
  onRankClick: (album: Album) => void;
  onRankChange: (value: string) => void;
  onRankSubmit: (albumId: number) => void;
  onRankCancel: () => void;
}> = ({ 
  album, 
  isMobile, 
  isEditingRank, 
  newRankValue, 
  onRankClick, 
  onRankChange, 
  onRankSubmit, 
  onRankCancel 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: album.id.toString(),
    disabled: isMobile // Disable dragging on mobile
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{ 
        ...style, 
        cursor: isMobile ? 'pointer' : (isDragging ? 'grabbing' : 'grab') 
      }}
      {...(!isMobile ? attributes : {})}
      {...(!isMobile ? listeners : {})}
      className={`album-item-compact ${isDragging ? 'dragging' : ''}`}
      onClick={isMobile ? () => onRankClick(album) : undefined}
    >
      {isEditingRank ? (
        <div className="album-rank editing">
          <input
            type="number"
            value={newRankValue}
            onChange={(e) => onRankChange(e.target.value)}
            onBlur={() => onRankSubmit(album.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onRankSubmit(album.id);
              if (e.key === 'Escape') onRankCancel();
            }}
            min="1"
            max="100"
            autoFocus
            style={{
              width: '24px',
              height: '24px',
              fontSize: '0.6rem',
              textAlign: 'center',
              border: 'none',
              borderRadius: '50%',
              background: '#3498db',
              color: 'white'
            }}
          />
        </div>
      ) : (
        <div 
          className="album-rank" 
          style={{ cursor: isMobile ? 'pointer' : 'inherit' }}
        >
          #{album.rank}
        </div>
      )}
      <div className="album-cover-compact">
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
        </div>
      </div>
    </div>
  );
};

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
  const [isEditMode, setIsEditMode] = React.useState(false)
  const [originalAlbums, setOriginalAlbums] = React.useState<Album[]>([])
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [editingRankId, setEditingRankId] = React.useState<number | null>(null)
  const [newRankValue, setNewRankValue] = React.useState<string>('')
  const [isMobile, setIsMobile] = React.useState(false)

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

  // Mobile detection
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle body scroll lock for mobile edit mode
  React.useEffect(() => {
    if (isMobile && isEditMode) {
      document.body.style.overflow = 'hidden'
      document.body.style.height = '100vh'
    } else {
      document.body.style.overflow = ''
      document.body.style.height = ''
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = ''
      document.body.style.height = ''
    }
  }, [isMobile, isEditMode])

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

  // Edit mode functions
  const handleEditMode = () => {
    setOriginalAlbums([...albums]) // Save current state for cancel
    setIsEditMode(true)
  }

  const handleSaveChanges = async () => {
    try {
      setLoading(true)
      
      // Create rankings array with albumId and rank
      const rankings = albums.map((album, index) => ({
        albumId: album.id,
        rank: index + 1
      }))
      
      const token = localStorage.getItem('adminToken')
      const response = await fetch(buildApiUrl('/api/albums/reorder'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rankings })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to save album order: ${response.status} - ${errorText}`)
      }

      setIsEditMode(false)
      setExpandedAlbum(null)
      
      // Refresh the data from the server to ensure consistency
      await fetchAlbumsFromApi()
      
    } catch (error) {
      console.error('Error saving album order:', error)
      setError('Failed to save changes. Please try again.')
      // Restore original order on error
      setAlbums([...originalAlbums])
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setAlbums([...originalAlbums]) // Restore original state
    setIsEditMode(false)
    setExpandedAlbum(null)
    setEditingRankId(null)
    setNewRankValue('')
  }

  // Mobile rank editing functions
  const handleRankClick = (album: Album) => {
    if (isMobile && isEditMode) {
      setEditingRankId(album.id)
      setNewRankValue(album.rank.toString())
    }
  }

  const handleRankChange = (value: string) => {
    setNewRankValue(value)
  }

  const handleRankSubmit = (albumId: number) => {
    const newRank = parseInt(newRankValue)
    if (isNaN(newRank) || newRank < 1 || newRank > filteredAlbums.length) {
      setEditingRankId(null)
      setNewRankValue('')
      return
    }

    // Find the album being moved
    const albumToMove = albums.find(a => a.id === albumId)
    if (!albumToMove) return

    // Create a copy of albums without the moved album
    const otherAlbums = albums.filter(a => a.id !== albumId)
    
    // Sort other albums by current rank
    otherAlbums.sort((a, b) => a.rank - b.rank)
    
    // Insert the moved album at the new position
    const updatedAlbums = [...otherAlbums]
    updatedAlbums.splice(newRank - 1, 0, { ...albumToMove, rank: newRank })
    
    // Update ranks for all albums
    const rerankedAlbums = updatedAlbums.map((album, index) => ({
      ...album,
      rank: index + 1
    }))

    setAlbums(rerankedAlbums)
    setEditingRankId(null)
    setNewRankValue('')
  }

  const handleRankCancel = () => {
    setEditingRankId(null)
    setNewRankValue('')
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = filteredAlbums.findIndex(album => album.id.toString() === active.id)
    const newIndex = filteredAlbums.findIndex(album => album.id.toString() === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedAlbums = arrayMove(filteredAlbums, oldIndex, newIndex)
      
      // Update ranks based on new positions for live preview
      const updatedAlbums = reorderedAlbums.map((album, index) => ({
        ...album,
        rank: index + 1
      }))

      setAlbums(updatedAlbums)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    
    const { active, over } = event
    
    if (!over || active.id === over.id) {
      return
    }

    // The reordering was already handled in handleDragOver
    // This just finalizes the drag operation
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
          <p className="page-description">Please log in to view the album collection.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="favorite-albums-page">
      <div className={`container ${isEditMode ? 'edit-mode' : ''}`}>


        
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
          {isEditMode ? (
            <div className="edit-mode-header">
              <h3>Editing Albums - {isMobile ? 'Click album to edit' : 'Drag to reorder'}</h3>
              <div className="edit-actions">
                <button 
                  onClick={handleSaveChanges}
                  className="save-button"
                >
                  Save Changes
                </button>
                <button 
                  onClick={handleCancelEdit}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
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
              
              <div className="edit-controls">
                <button 
                  onClick={handleEditMode}
                  className="edit-button"
                >
                  Edit Rankings
                </button>
              </div>
            </>
          )}
        </div>
        
        {isEditMode ? (
          // Edit mode with drag and drop
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={filteredAlbums.map(album => album.id.toString())}
              strategy={rectSortingStrategy}
            >
              <div className="albums-list edit-mode">
                {filteredAlbums.map((album) => (
                  <SortableAlbumItem 
                    key={album.id} 
                    album={album}
                    isMobile={isMobile}
                    isEditingRank={editingRankId === album.id}
                    newRankValue={newRankValue}
                    onRankClick={handleRankClick}
                    onRankChange={handleRankChange}
                    onRankSubmit={handleRankSubmit}
                    onRankCancel={handleRankCancel}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                <div className="album-item-compact dragging">
                  {(() => {
                    const draggedAlbum = filteredAlbums.find(album => album.id.toString() === activeId)
                    if (!draggedAlbum) return null
                    return (
                      <>
                        <div className="album-rank">#{draggedAlbum.rank}</div>
                        <div className="album-cover-compact">
                          <img 
                            src={draggedAlbum.cover_image} 
                            alt={`${draggedAlbum.title} by ${draggedAlbum.artist}`}
                          />
                        </div>
                      </>
                    )
                  })()}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          // Normal view without drag and drop
        <div className="albums-list">
          {filteredAlbums.map((album) => {
            const isExpanded = expandedAlbum === album.id
            const isLastInRow = album.rank % 5 === 0
            const isSecondToLastInRow = album.rank % 5 === 4
            
              // On mobile, always expand right; on desktop, use position logic
              const expandDirection = isMobile 
                ? 'expand-right' 
                : (isLastInRow || isSecondToLastInRow ? 'expand-left' : 'expand-right')
              
            return (
              <div 
                key={album.id} 
                  className={`album-item ${isExpanded ? 'expanded' : ''} ${isExpanded ? expandDirection : ''}`}
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
        )}
        
        <div className="add-album-section">
          <h2>Add New Album</h2>
          <p>Want to add more albums to this list? You can edit the data in the component file.</p>
        </div>
      </div>
    </div>
  )
}

export default FavoriteAlbums