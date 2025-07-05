import React, { useState, useRef, useEffect } from 'react';
import './BeatsPlayer.css';

interface Beat {
  id: string;
  title: string;
  filename: string;
  duration?: number;
}

const BeatsPlayer: React.FC = () => {
  const [beats] = useState<Beat[]>([
    { id: '1', title: 'Jelly', filename: 'Jelly.wav' },
    { id: '2', title: 'Disposible People', filename: 'Disposible People.wav' },
    { id: '3', title: 'Crude Diameter', filename: 'Crude Diameter.wav' },
    { id: '4', title: 'Diabetic Wasp', filename: 'Diabetic Wasp.wav' },
    { id: '5', title: 'Dirty Spring', filename: 'Dirty Spring.wav' },
    { id: '6', title: 'Dry Fruit', filename: 'Dry Fruit.wav' },
    { id: '7', title: 'File Denial', filename: 'File Denial.wav' },
    { id: '8', title: 'Fourth Shelf', filename: 'Fourth Shelf.wav' },
    { id: '9', title: 'Grass Cabin', filename: 'Grass Cabin.wav' },
    { id: '10', title: 'Honey Lake', filename: 'Honey Lake.wav' },
    { id: '11', title: 'Ice Castle', filename: 'Ice Castle.wav' },
    { id: '12', title: 'Last Recess', filename: 'Last Recess.wav' },
    { id: '13', title: 'Liquid Spill', filename: 'Liquid Spill.wav' },
    { id: '14', title: 'Live Concept', filename: 'Live Concept.wav' },
    { id: '15', title: 'Lost Identity', filename: 'Lost Identity.wav' },
    { id: '16', title: 'Midnight Eagle', filename: 'Midnight Eagle.wav' },
    { id: '17', title: 'Mindless Observation', filename: 'Mindless Observation.wav' },
    { id: '18', title: 'Mister Bill', filename: 'Mister Bill.wav' },
    { id: '19', title: 'Mortal Herb', filename: 'Mortal Herb.wav' },
    { id: '20', title: 'Mystic Pilot', filename: 'Mystic Pilot.wav' },
    { id: '21', title: 'Nude Smuggler', filename: 'Nude Smuggler.wav' },
    { id: '22', title: 'Peak Hospitality', filename: 'Peak Hospitality.wav' },
    { id: '23', title: 'Regional Alignment', filename: 'Regional Alignment.wav' },
    { id: '24', title: 'Secret Landing', filename: 'Secret Landing.wav' },
    { id: '25', title: 'Square Dogs', filename: 'Square Dogs.wav' },
    { id: '26', title: 'Steel Injection', filename: 'Steel Injection.wav' },
    { id: '27', title: 'Tactical Kidnapper', filename: 'Tactical Kidnapper.wav' },
    { id: '28', title: 'The Quad', filename: 'The Quad.wav' },
    { id: '29', title: 'Wobbly Anchor', filename: 'Wobbly Anchor.wav' },
    { id: '30', title: 'Wood Furnace', filename: 'Wood Furnace.wav' },
    { id: '31', title: 'A Bug World', filename: 'A Bug World.wav' },
    { id: '32', title: 'Absent Elements', filename: 'Absent Elements.wav' },
    { id: '33', title: 'Antelopes', filename: 'Antelopes.wav' },
    { id: '34', title: 'Apple Grahams', filename: 'Apple Grahams.wav' },
    { id: '35', title: 'Bear Claw', filename: 'Bear Claw.wav' },
    { id: '36', title: 'Bent Axle', filename: 'Bent Axle.wav' },
    { id: '37', title: 'Bone Yard', filename: 'Bone Yard.wav' },
    { id: '38', title: 'Brave Fish', filename: 'Brave Fish.wav' },
    { id: '39', title: 'Breeze', filename: 'Breeze.wav' },
    { id: '40', title: 'Broken Thermus', filename: 'Broken Thermus.wav' },
    { id: '41', title: 'Cheese Staircase', filename: 'Cheese Staircase.wav' },
    { id: '42', title: 'Chocolate Swivel', filename: 'Chocolate Swivel.wav' },
  ]);

  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [pendingAutoPlay, setPendingAutoPlay] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const hasLoadedFromStorage = useRef(false);

  const sortedBeats = beats.sort((a, b) => a.title.localeCompare(b.title));
  const filteredBeats = showFavoritesOnly 
    ? sortedBeats.filter(beat => favorites.includes(beat.id))
    : sortedBeats;

  // Load favorites from local storage on component mount
  useEffect(() => {
    // Clear any existing empty array to start fresh
    const existingFavorites = localStorage.getItem('beats-favorites');
    if (existingFavorites === '[]') {
      localStorage.removeItem('beats-favorites');
    }
    
    const savedFavorites = localStorage.getItem('beats-favorites');
    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites);
        setFavorites(parsedFavorites);
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
    hasLoadedFromStorage.current = true;
  }, []);

  // Save favorites to local storage whenever they change
  useEffect(() => {
    // Only save after we've loaded from storage to avoid overwriting on initial load
    if (!hasLoadedFromStorage.current) {
      return;
    }
    
    localStorage.setItem('beats-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Handle URL parameters for shared tracks
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const trackPosition = urlParams.get('track');
    
    if (trackPosition) {
      console.log('URL parameter found:', trackPosition);
      
      // Convert position to index (1-based to 0-based)
      const trackIndex = parseInt(trackPosition) - 1;
      console.log('Track index:', trackIndex);
      
      // Get the beat at that alphabetical position
      const beat = filteredBeats[trackIndex];
      console.log('Found beat:', beat);
      
      if (beat) {
        // Store the beat ID for later playback after user interaction
        setPendingAutoPlay(beat.id);
        console.log('Set pending autoplay for:', beat.title);
      }
    }
  }, [filteredBeats]);

  const handlePlay = (beatId: string) => {
    // Stop all other audio
    Object.keys(audioRefs.current).forEach(id => {
      if (id !== beatId && audioRefs.current[id]) {
        audioRefs.current[id]?.pause();
        audioRefs.current[id]!.currentTime = 0;
      }
    });

    setCurrentlyPlaying(beatId);
    setIsPlaying(true);
    
    // Clear any pending autoplay since user has interacted
    if (pendingAutoPlay) {
      setPendingAutoPlay(null);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    if (isRepeat && currentlyPlaying) {
      // Restart the same track
      const audio = audioRefs.current[currentlyPlaying];
      if (audio) {
        audio.currentTime = 0;
        audio.play();
      }
    } else {
      // Play next track or stop
      if (filteredBeats.length > 1) {
        playNextTrack();
      } else {
        // If only one track, just stop
        setCurrentlyPlaying(null);
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }
  };

  const handleTimeUpdate = (beatId: string) => {
    const audio = audioRefs.current[beatId];
    if (audio && currentlyPlaying === beatId) {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRefs.current[currentlyPlaying!];
    if (audio) {
      const newTime = (parseFloat(e.target.value) / 100) * audio.duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const togglePlayPause = () => {
    const audio = audioRefs.current[currentlyPlaying!];
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    }
  };

  const playNextTrack = () => {
    if (!currentlyPlaying) return;
    
    const currentIndex = filteredBeats.findIndex(beat => beat.id === currentlyPlaying);
    const nextIndex = (currentIndex + 1) % filteredBeats.length;
    const nextBeat = filteredBeats[nextIndex];
    
    if (nextBeat) {
      const audio = audioRefs.current[nextBeat.id];
      if (audio) {
        // Stop current track
        const currentAudio = audioRefs.current[currentlyPlaying];
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
        
        // Play next track
        audio.currentTime = 0;
        audio.play();
        setCurrentlyPlaying(nextBeat.id);
        setIsPlaying(true);
      }
    }
  };

  const playPreviousTrack = () => {
    if (!currentlyPlaying) return;
    
    const currentIndex = filteredBeats.findIndex(beat => beat.id === currentlyPlaying);
    const prevIndex = currentIndex === 0 ? filteredBeats.length - 1 : currentIndex - 1;
    const prevBeat = filteredBeats[prevIndex];
    
    if (prevBeat) {
      const audio = audioRefs.current[prevBeat.id];
      if (audio) {
        // Stop current track
        const currentAudio = audioRefs.current[currentlyPlaying];
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
        
        // Play previous track
        audio.currentTime = 0;
        audio.play();
        setCurrentlyPlaying(prevBeat.id);
        setIsPlaying(true);
      }
    }
  };

  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  const shareTrack = async (beatId: string) => {
    const beat = beats.find(b => b.id === beatId);
    if (!beat) return;

    // Find the alphabetical position of this beat
    const alphabeticalIndex = filteredBeats.findIndex(b => b.id === beatId);
    const shareUrl = `${window.location.origin}/creative/music/beats?track=${alphabeticalIndex + 1}`;
    copyToClipboard(shareUrl);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    }
  };

  const toggleFavorite = (beatId: string) => {
    setFavorites(prev => 
      prev.includes(beatId) 
        ? prev.filter(id => id !== beatId)
        : [...prev, beatId]
    );
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="beats-player">
      <div className="beats-header">
        <h1>Beats</h1>
        <div className="favorites-toggle">
          <button
            className={`toggle-button ${showFavoritesOnly ? 'active' : ''}`}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            {showFavoritesOnly ? '⭐ Show All' : '⭐ Show Favorites'}
          </button>
        </div>
      </div>

      {/* Pending Autoplay Notification */}
      {pendingAutoPlay && (
        <div className="autoplay-notification">
          <div className="autoplay-content">
            <span>🎵 Click to play shared track</span>
            <button 
              className="autoplay-button"
              onClick={() => {
                const audio = audioRefs.current[pendingAutoPlay];
                if (audio) {
                  audio.play();
                  setPendingAutoPlay(null);
                }
              }}
            >
              Play Now
            </button>
          </div>
        </div>
      )}

      <div className="beats-list">
        {filteredBeats.map((beat, index) => (
          <div key={beat.id} className={`beat-item ${currentlyPlaying === beat.id ? 'playing' : ''}`}>
            <div className="beat-number">{index + 1}</div>
            <div className="beat-info">
              <h3 className="beat-title">{beat.title}</h3>
            </div>
            <div className="beat-controls">
                              <audio
                  ref={(el) => {
                    audioRefs.current[beat.id] = el;
                  }}
                  src={`/audio/beats/${beat.filename}`}
                  onPlay={() => handlePlay(beat.id)}
                  onPause={handlePause}
                  onEnded={handleEnded}
                  onTimeUpdate={() => handleTimeUpdate(beat.id)}
                  preload="metadata"
                />
              
              <button
                className={`play-button ${currentlyPlaying === beat.id ? 'playing' : ''}`}
                onClick={() => {
                  const audio = audioRefs.current[beat.id];
                  if (audio) {
                    if (currentlyPlaying === beat.id) {
                      audio.pause();
                    } else {
                      audio.play();
                    }
                  }
                }}
              >
                {currentlyPlaying === beat.id ? (
                  <span className="pause-icon">⏸</span>
                ) : (
                  <span className="play-icon">▶</span>
                )}
              </button>

              <div className="volume-control">
                <span className="volume-icon">🔊</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="100"
                  className="volume-slider"
                  onChange={(e) => {
                    const audio = audioRefs.current[beat.id];
                    if (audio) {
                      audio.volume = parseFloat(e.target.value) / 100;
                    }
                  }}
                />
              </div>

              <button
                className="share-button"
                onClick={() => shareTrack(beat.id)}
                title="Share this track"
              >
                <span className="share-icon">📤</span>
              </button>

              <button
                className={`favorite-button ${favorites.includes(beat.id) ? 'favorited' : ''}`}
                onClick={() => toggleFavorite(beat.id)}
                title={favorites.includes(beat.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                <span className="star-icon">{favorites.includes(beat.id) ? '⭐' : '☆'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Copied Message */}
      {showCopiedMessage && (
        <div className="copied-message">
          <span>Link copied to clipboard! 📋</span>
        </div>
      )}

      {/* Fixed Player at Bottom */}
      {currentlyPlaying && (
        <div className="fixed-player">
          <div className="player-content">
            <div className="player-info">
              <h4 className="player-title">
                {beats.find(b => b.id === currentlyPlaying)?.title}
              </h4>
              <div className="player-time">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </div>
            </div>
            
            <div className="player-controls">
              <button
                className="player-control-button"
                onClick={playPreviousTrack}
                title="Previous Track"
              >
                <span className="prev-icon">⏮</span>
              </button>
              
              <button
                className="player-play-button"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <span className="pause-icon">⏸</span>
                ) : (
                  <span className="play-icon">▶</span>
                )}
              </button>
              
              <button
                className="player-control-button"
                onClick={playNextTrack}
                title="Next Track"
              >
                <span className="next-icon">⏭</span>
              </button>
              
              <button
                className={`player-control-button ${isRepeat ? 'active' : ''}`}
                onClick={toggleRepeat}
                title="Repeat"
              >
                <span className="repeat-icon">🔁</span>
              </button>
            </div>

            <div className="player-progress">
              <input
                type="range"
                min="0"
                max="100"
                value={duration > 0 ? (currentTime / duration) * 100 : 0}
                onChange={handleProgressChange}
                className="progress-slider"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeatsPlayer; 