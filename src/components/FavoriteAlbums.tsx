import React, { useState, useRef } from 'react';
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
  onRemoveAlbum: (albumId: number) => void;
  isStaged: boolean;
}> = ({ 
  album, 
  isMobile, 
  isEditingRank, 
  newRankValue, 
  onRankClick, 
  onRankChange, 
  onRankSubmit, 
  onRankCancel,
  onRemoveAlbum,
  isStaged
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
      <button 
        className="remove-album-btn"
        onPointerDown={(e) => {
          e.stopPropagation()
          e.preventDefault()
        }}
        onClick={(e) => {
          e.stopPropagation()
          onRemoveAlbum(album.id)
        }}
        title="Remove album from list"
      >
        X
      </button>
      
      {/* Staged indicator for staged albums */}
      {isStaged && (
        <div className="staged-badge" title="This album is staged and will be saved when you click 'Save Changes'">
        </div>
      )}
      
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
  const [originalAlbums, setOriginalAlbums] = React.useState<Album[]>([])
  const [stagedAlbums, setStagedAlbums] = useState<Album[]>([])
  const [stagedRemovals, setStagedRemovals] = useState<Album[]>([])
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingRankId, setEditingRankId] = useState<number | null>(null)
  const [newRankValue, setNewRankValue] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  
  // Mobile swipe state for edit mode
  const [currentScreen, setCurrentScreen] = useState<'albums' | 'add-new'>('albums');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSliding, setIsSliding] = useState(false);
  const [isReturningFromLeft, setIsReturningFromLeft] = useState(false);

  // Ref to the AddNewAlbumsPanel to call its functions
  const addNewAlbumsPanelRef = useRef<{ addAlbumToAvailableList: (album: Album) => void }>(null)

  // Touch handlers for mobile swipe in edit mode
  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (!isEditMode || !isMobile) return; // Only handle swipes in edit mode on mobile
    setTouchStart(e.targetTouches[0].clientX);
  }, [isEditMode, isMobile]);

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!isEditMode || !isMobile) return;
    setTouchEnd(e.targetTouches[0].clientX);
  }, [isEditMode, isMobile]);

  const handleTouchEnd = React.useCallback(() => {
    if (!isEditMode || !touchStart || !touchEnd || !isMobile) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentScreen === 'albums') {
      // Start sliding animation
      setIsSliding(true);
      
      // After animation completes, change screen
      setTimeout(() => {
        setCurrentScreen('add-new');
        setIsSliding(false);
      }, 300); // Match CSS transition duration
    } else if (isRightSwipe && currentScreen === 'add-new') {
      // Start returning from left animation
      setIsReturningFromLeft(true);
      
      // After animation completes, change screen
      setTimeout(() => {
        setCurrentScreen('albums');
        setIsReturningFromLeft(false);
      }, 300); // Match CSS transition duration
    }

    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, currentScreen, isEditMode, isMobile]);

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
    if (isEditMode) {
      // Exit edit mode
      setIsEditMode(false)
      setStagedAlbums([])
      setStagedRemovals([])
      setEditingRankId(null)
      setNewRankValue('')
      setActiveId(null)
    } else {
      // Enter edit mode
      setOriginalAlbums([...albums]) // Save current state for cancel
      setStagedAlbums([]) // Initialize empty staged albums
      setStagedRemovals([]) // Initialize empty staged removals
                   setCurrentScreen('albums') // Reset to albums page when entering edit mode
             setIsSliding(false) // Reset sliding animation state
             setIsReturningFromLeft(false) // Reset returning from left animation state
      setIsEditMode(true)
    }
  }

  const handleSaveChanges = async () => {
    try {
      setLoading(true)
      
      // Check if there are any net changes to save
      const hasNetChanges = stagedAlbums.length > 0 || stagedRemovals.length > 0
      
      if (!hasNetChanges) {
        // No changes to save, just exit edit mode
        setIsEditMode(false)
        setExpandedAlbum(null)
        return
      }
      
      // First, add any staged albums to the user's list
      if (stagedAlbums.length > 0) {
        const token = localStorage.getItem('adminToken')
        if (!token) {
          throw new Error('No authentication token found')
        }

        // Add staged albums one by one
        for (const album of stagedAlbums) {
          const response = await fetch(buildApiUrl(`/api/albums/${album.id}/add`), {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(`Failed to add album ${album.title}: ${errorData.error}`)
          }
        }
      }

      // Then, remove any staged removals from the user's list
      if (stagedRemovals.length > 0) {
        const token = localStorage.getItem('adminToken')
        if (!token) {
          throw new Error('No authentication token found')
        }

        // Remove staged albums one by one
        for (const album of stagedRemovals) {
          const response = await fetch(buildApiUrl(`/api/albums/${album.id}/remove`), {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(`Failed to remove album ${album.title}: ${errorData.error}`)
          }

          // Add the removed album back to the available list
          if (addNewAlbumsPanelRef.current) {
            addNewAlbumsPanelRef.current.addAlbumToAvailableList(album)
          }
        }
      }
      
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
      setStagedAlbums([]) // Clear staged albums after successful save
      setStagedRemovals([]) // Clear staged removals after successful save
      
      // Refresh the data from the server to ensure consistency
      await fetchAlbumsFromApi()
      
    } catch (error) {
      console.error('Error saving changes:', error)
      setError('Failed to save changes. Please try again.')
      // Restore original order on error
      setAlbums([...originalAlbums])
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setAlbums([...originalAlbums]) // Restore original state
    setStagedAlbums([]) // Clear staged albums
    setStagedRemovals([]) // Clear staged removals
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

  // Check if an album is staged for addition or removal
  const isAlbumStaged = (albumId: number) => {
    return stagedAlbums.some(album => album.id === albumId) || 
           stagedRemovals.some(album => album.id === albumId)
  }

  // Function to add an album to staged additions
  const addToStagedAlbums = (album: Album) => {
    setStagedAlbums(prev => {
      // Check if this album is already staged for removal
      const isStagedForRemoval = stagedRemovals.some(a => a.id === album.id)
      
      if (isStagedForRemoval) {
        // If it's staged for removal, remove it from removals instead of adding to additions
        setStagedRemovals(prevRemovals => prevRemovals.filter(a => a.id !== album.id))
        return prev // Don't add to additions
      }
      
      // Otherwise, add to staged additions
      return [...prev, album]
    })
  }

  const handleRemoveAlbum = async (albumId: number) => {
    // Find the album to remove
    const albumToRemove = albums.find(album => album.id === albumId)
    if (!albumToRemove) {
      console.error('Album not found for removal:', albumId)
      return
    }

    // Check if this album is already staged for addition
    const isStagedForAddition = stagedAlbums.some(a => a.id === albumId)
    
    if (isStagedForAddition) {
      // If it's staged for addition, remove it from additions instead of staging for removal
      setStagedAlbums(prev => prev.filter(a => a.id !== albumId))
      
      // Remove from the current albums list for display
      setAlbums(prev => prev.filter(album => album.id !== albumId))
      
      // Add it back to the available list
      if (addNewAlbumsPanelRef.current) {
        addNewAlbumsPanelRef.current.addAlbumToAvailableList(albumToRemove)
      }
      
      console.log('Album removed from staged additions:', albumToRemove.title)
      return
    }

    // Stage the album for removal instead of removing immediately
    setStagedRemovals(prev => [...prev, albumToRemove])
    
    // Remove from the current albums list for display
    setAlbums(prev => prev.filter(album => album.id !== albumId))
    
    // Immediately add the album back to the available list so it shows up in Add New Albums panel
    if (addNewAlbumsPanelRef.current) {
      addNewAlbumsPanelRef.current.addAlbumToAvailableList(albumToRemove)
    }
    
    console.log('Album staged for removal:', albumToRemove.title)
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
    const { active, over } = event

    if (active.id !== over?.id) {
      setAlbums((items) => {
        const oldIndex = items.findIndex((item) => item.id.toString() === active.id)
        const newIndex = items.findIndex((item) => item.id.toString() === over?.id)

        // Check if the order actually changed
        if (oldIndex !== newIndex) {
          // Order change detection is now handled by checkOrderChanged function
        }

        return arrayMove(items, oldIndex, newIndex)
      })
    }

    setActiveId(null)
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

  const checkOrderChanged = (originalAlbums: Album[], currentAlbums: Album[]) => {
    if (!originalAlbums || originalAlbums.length === 0) return false
    return currentAlbums.some((album, index) => originalAlbums[index]?.id !== album.id)
  }

  const hasAnyChanges = () => {
    return stagedAlbums.length > 0 || stagedRemovals.length > 0 || checkOrderChanged(originalAlbums, albums)
  }

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
        
        {/* Edit Mode Header */}
        {isEditMode && (
          <div className="edit-mode-header">
            <h3>Editing Albums - {isMobile ? 'Click album to edit' : 'Drag to reorder'}</h3>
            {hasAnyChanges() && (
              <div className="staged-count">
                {stagedAlbums.length > 0 && (
                  <span>{stagedAlbums.length} album{stagedAlbums.length !== 1 ? 's' : ''} staged for addition</span>
                )}
                {stagedAlbums.length > 0 && stagedRemovals.length > 0 && <span> • </span>}
                {stagedRemovals.length > 0 && (
                  <span>{stagedRemovals.length} album{stagedRemovals.length !== 1 ? 's' : ''} staged for removal</span>
                )}
                {(stagedAlbums.length > 0 || stagedRemovals.length > 0) && checkOrderChanged(originalAlbums, albums) && <span> • </span>}
                {checkOrderChanged(originalAlbums, albums) && (
                  <span>Order changed</span>
                )}
              </div>
            )}
            <div className="edit-actions">
              <button 
                onClick={handleSaveChanges}
                className="save-button"
                disabled={!hasAnyChanges()}
              >
                                  {hasAnyChanges() ? 'Save' : 'No Changes'}
              </button>
              <button 
                onClick={handleCancelEdit}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filter and Sort Controls */}
        {!isEditMode && (
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
                
            <div className="edit-controls">
              <button 
                onClick={handleEditMode}
                className="edit-button"
              >
                Edit Rankings
              </button>
            </div>
          </div>
        )}
        
        {isEditMode ? (
          // Mobile: Swipeable pages, Desktop: Normal layout
          isMobile ? (
            <div 
              className="mobile-pages-container"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Albums Page */}
              <div className={`mobile-page ${currentScreen === 'albums' ? 'active' : ''} ${isSliding ? 'sliding-left' : ''} ${isReturningFromLeft ? 'returning-from-left' : ''}`}>
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
                          onRemoveAlbum={handleRemoveAlbum}
                          isStaged={isAlbumStaged(album.id)}
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
              </div>

              {/* Add New Albums Page */}
              <div className={`mobile-page ${currentScreen === 'add-new' ? 'active' : ''}`}>
                <AddNewAlbumsPanel 
                  ref={addNewAlbumsPanelRef}
                  stagedRemovals={stagedRemovals}
                  onAlbumStaged={(album) => {
                    addToStagedAlbums(album)
                    const nextRank = albums.length + 1
                    setAlbums(prev => [...prev, { ...album, rank: nextRank }])
                    console.log('Album staged for addition:', album.title)
                  }}
                />
              </div>


            </div>
          ) : (
            // Desktop: Normal layout with both panels visible
            <>
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
                        onRemoveAlbum={handleRemoveAlbum}
                        isStaged={isAlbumStaged(album.id)}
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
              
              {/* Desktop: Add New Albums Panel */}
              <AddNewAlbumsPanel 
                ref={addNewAlbumsPanelRef}
                stagedRemovals={stagedRemovals}
                onAlbumStaged={(album) => {
                  addToStagedAlbums(album)
                  const nextRank = albums.length + 1
                  setAlbums(prev => [...prev, { ...album, rank: nextRank }])
                  console.log('Album staged for addition:', album.title)
                }}
              />
            </>
          )
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
                {isEditMode && (
                  <button 
                    className="remove-album-btn"
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveAlbum(album.id)
                    }}
                    title="Remove album from list"
                  >
                    X
                  </button>
                )}
                
                <div className="album-rank">#{album.rank}</div>
                
                {/* Staged indicator for staged albums */}
                {isAlbumStaged(album.id) && (
                  <div className="staged-badge" title="This album is staged and will be saved when you click 'Save Changes'">
                  </div>
                )}
                
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
        
        {/* Add New Albums Panel is now integrated into mobile pages system above */}
      </div>
    </div>
  )
}

// Add New Albums Panel Component
const AddNewAlbumsPanel = React.forwardRef<{ addAlbumToAvailableList: (album: Album) => void }, {
  stagedRemovals: Album[]
  onAlbumStaged: (album: Album) => void
}>(({ stagedRemovals, onAlbumStaged }, ref) => {
  const [artistSearch, setArtistSearch] = React.useState('')
  const [titleSearch, setTitleSearch] = React.useState('')
  const [allAvailableAlbums, setAllAvailableAlbums] = React.useState<Album[]>([])
  const [filteredAlbums, setFilteredAlbums] = React.useState<Album[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchError, setSearchError] = React.useState<string | null>(null)
  const [addingAlbum, setAddingAlbum] = React.useState<number | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

  // Function to add an album back to the available list
  const addAlbumToAvailableList = React.useCallback((album: Album) => {
    setAllAvailableAlbums(prev => {
      // Only add if it's not already in the list
      if (!prev.some(a => a.id === album.id)) {
        // Insert the album in the correct alphabetical position
        const newList = [...prev, album]
        newList.sort((a, b) => {
          // First sort by title (album name), then by artist
          const titleCompare = a.title.localeCompare(b.title)
          if (titleCompare !== 0) return titleCompare
          return a.artist.localeCompare(b.artist)
        })
        return newList
      }
      return prev
    })
  }, [])

  // Expose the function to parent component via ref
  React.useImperativeHandle(ref, () => ({
    addAlbumToAvailableList
  }), [addAlbumToAvailableList])

  // Load all available albums when component mounts
  React.useEffect(() => {
    const loadAllAlbums = async () => {
      try {
        const storedToken = localStorage.getItem('adminToken')
        if (!storedToken) {
          throw new Error('No authentication token found')
        }

        // Get all available albums
        const response = await fetch(buildApiUrl('/api/albums/available'), {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`Failed to load albums: ${response.status}`)
        }

        const data = await response.json()
        setAllAvailableAlbums(data.albums || [])
        setFilteredAlbums(data.albums || [])
      } catch (error) {
        console.error('Error loading albums:', error)
        setSearchError(error instanceof Error ? error.message : 'Failed to load albums')
      } finally {
        setIsLoading(false)
      }
    }

    loadAllAlbums()
  }, [])

  // Filter albums whenever search terms change
  React.useEffect(() => {
    filterAlbums()
  }, [artistSearch, titleSearch, allAvailableAlbums])

  const filterAlbums = () => {
    if (!artistSearch.trim() && !titleSearch.trim()) {
      // If no search terms, show all albums
      setFilteredAlbums(allAvailableAlbums)
      setSearchError(null)
      return
    }

    setSearchError(null)
    
    // Filter the existing list based on search terms
    const filtered = allAvailableAlbums.filter(album => {
      const artistMatch = !artistSearch.trim() || 
        album.artist.toLowerCase().includes(artistSearch.trim().toLowerCase())
      const titleMatch = !titleSearch.trim() || 
        album.title.toLowerCase().includes(titleSearch.trim().toLowerCase())
      
      return artistMatch && titleMatch
    })

    setFilteredAlbums(filtered)
    
    if (filtered.length === 0) {
      setSearchError('No albums found matching your search criteria.')
    }
  }



  const handleResultClick = async (album: Album) => {
    setAddingAlbum(album.id)
    setSuccessMessage(null)
    
    try {
      // Stage the album for addition (will be committed when Save Changes is clicked)
      onAlbumStaged(album)
      
      setSuccessMessage(`${album.title} by ${album.artist} staged for addition!`)
      setArtistSearch('')
      setTitleSearch('')
      
      // Remove the album from both local state arrays since it's now staged
      setAllAvailableAlbums(prev => prev.filter(a => a.id !== album.id))
      setFilteredAlbums(prev => prev.filter(a => a.id !== album.id))
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('Error staging album:', error)
    } finally {
      setAddingAlbum(null)
    }
  }

  return (
    <div className="add-new-albums-panel">
      <h2>Add New Albums</h2>
      <p>Browse and filter available albums to add to your collection</p>
      
      <div className="search-form">
        <div className="search-inputs">
          <div className="search-input-group">
            <label htmlFor="artist-search">Artist:</label>
            <input
              id="artist-search"
              type="text"
              value={artistSearch}
              onChange={(e) => setArtistSearch(e.target.value)}
              placeholder="Enter artist name..."
              className="search-input"
            />
          </div>
          
          <div className="search-input-group">
            <label htmlFor="title-search">Album Title:</label>
            <input
              id="title-search"
              type="text"
              value={titleSearch}
              onChange={(e) => setTitleSearch(e.target.value)}
              placeholder="Enter album title..."
              className="search-input"
            />
          </div>
        </div>
        
        <div className="search-actions">
          <button 
            type="button" 
            className="add-new-button"
            onClick={() => {
              // TODO: Implement adding completely new album
              console.log('Add new album functionality to be implemented')
            }}
          >
            Add New Album
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="loading-state">
          <p>Loading available albums...</p>
        </div>
      )}

      {searchError && (
        <div className="search-error">
          {searchError}
        </div>
      )}

      {successMessage && (
        <div className="search-success">
          {successMessage}
        </div>
      )}

      {!isLoading && filteredAlbums.length > 0 && (
        <div className="search-results">
          <h3>Available Albums ({filteredAlbums.length})</h3>
          <div className="results-grid">
            {filteredAlbums.map((album: Album) => (
              <div 
                key={album.id} 
                className={`result-item ${addingAlbum === album.id ? 'adding' : ''} ${stagedRemovals.some(a => a.id === album.id) ? 'staged-for-removal' : ''}`}
                onClick={() => handleResultClick(album)}
              >
                {/* Orange border for albums staged for removal - positioned around entire card */}
                {stagedRemovals.some(a => a.id === album.id) && (
                  <div className="staged-badge" title="This album is staged for removal and will be removed when you click 'Save Changes'">
                  </div>
                )}
                <div className="result-cover">
                  <img 
                    src={album.cover_image} 
                    alt={`${album.title} by ${album.artist}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="result-cover-placeholder hidden">
                    <div className="placeholder-icon">🎵</div>
                  </div>
                  {addingAlbum === album.id && (
                    <div className="adding-overlay">
                      <div className="adding-spinner">⏳</div>
                      <div className="adding-text">Adding...</div>
                    </div>
                  )}
                </div>
                <div className="result-info">
                  <h4 className="result-title">{album.title}</h4>
                  <p className="result-artist">{album.artist}</p>
                  <p className="result-year">{album.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && filteredAlbums.length === 0 && !searchError && (
        <div className="no-results">
          <p>No albums found matching your search criteria.</p>
        </div>
      )}
    </div>
  )
})

export default FavoriteAlbums