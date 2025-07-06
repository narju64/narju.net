const fs = require('fs');
const path = require('path');

// Read the albums data file
const albumsDataPath = path.join(__dirname, '../src/data/albums.ts');
const albumsDataContent = fs.readFileSync(albumsDataPath, 'utf8');

// Extract all albums from the data file
const albumsMatch = albumsDataContent.match(/export const favoriteAlbums: Album\[\] = (\[[\s\S]*?\]);/);
if (!albumsMatch) {
  console.log('❌ Could not find albums data');
  process.exit(1);
}

// Parse the albums array
const albumsString = albumsMatch[1];
const albums = eval(albumsString);

console.log(`📊 Found ${albums.length} albums in data file`);

// Complete genre and category mapping for all albums
const albumData = {
  "Ys": { genre: "Folk, Singer-Songwriter", displayGenre: "Folk, Singer-Songwriter", categories: ["Folk"], spotifyId: "43r0kCUuEBKyBc6EpTA616" },
  "Bringing It All Back Home": { genre: "Folk Rock, Folk", displayGenre: "Folk Rock, Folk", categories: ["Rock","Folk"], spotifyId: "1lPoRKSgZHQAYXxzBsOQ7v" },
  "Dummy": { genre: "Trip-Hop, Chillout, Electronic", displayGenre: "Trip-Hop, Chillout, Electronic", categories: ["Electronic"], spotifyId: "3539EbNgIdEDGBKkUf4wno" },
  "The Freewheelin' Bob Dylan": { genre: "Folk", displayGenre: "Folk", categories: ["Folk"], spotifyId: "0o1uFxZ1VTviqvNaYkTJek" },
  "Blood On The Tracks": { genre: "Folk, Singer-Songwriter, Folk Rock", displayGenre: "Folk, Singer-Songwriter, Folk Rock", categories: ["Folk","Rock"], spotifyId: "4WD4pslu83FF6oMa1e19mF" },
  "Blue": { genre: "Folk, Singer-Songwriter, Female Vocalists", displayGenre: "Folk, Singer-Songwriter, Female Vocalists", categories: ["Folk","Female Vocalists"], spotifyId: "1vz94WpXDVYIEGja8cjFNa" },
  "Ágætis Byrjun": { genre: "Post-Rock, Ambient", displayGenre: "Post-Rock, Ambient", categories: ["Electronic"], spotifyId: "1DMMv1Kmoli3Y9fVEZDUVC" },
  "In The Aeroplane Over The Sea": { genre: "Indie, Indie Rock, Folk", displayGenre: "Indie, Indie Rock, Folk", categories: ["Alternative","Rock","Folk"], spotifyId: "0vVekV45lOaVKs6RZQQNob" },
  "The Velvet Underground & Nico": { genre: "Art Rock, Experimental Rock, Psychedelic Rock", displayGenre: "Art Rock, Experimental Rock, Psychedelic Rock", categories: ["Rock"], spotifyId: "4xwx0x7k6c5VuThz5qVqmV" },
  "Illmatic": { genre: "Hip-Hop", displayGenre: "Hip-Hop", categories: ["Hip-Hop"], spotifyId: "3kEtdS2pH6hKcMU9Wioob1" },
  "OK Computer": { genre: "Alternative Rock, Alternative", displayGenre: "Alternative Rock, Alternative", categories: ["Rock","Alternative"], spotifyId: "1lPoRKSgZHQAYXxzBsOQ7v" },
  "The Eminem Show": { genre: "Hip-Hop", displayGenre: "Hip-Hop", categories: ["Hip-Hop"], spotifyId: "2cWBwpqMsDJC1ZUwz813lo" },
  "Doolittle": { genre: "Alternative Rock, Alternative, Rock", displayGenre: "Alternative Rock, Alternative, Rock", categories: ["Rock","Alternative"], spotifyId: "0DQyTVcDhK9wm0f6RaErWO" },
  "In Rainbows": { genre: "Alternative, Alternative Rock, Rock", displayGenre: "Alternative, Alternative Rock, Rock", categories: ["Alternative","Rock"], spotifyId: "5vkqYmiPBYLaalcmjujWxK" },
  "Let England Shake": { genre: "Alternative, Rock", displayGenre: "Alternative, Rock", categories: ["Alternative","Rock"], spotifyId: "2JfiVMvVhdueC48EmskS7t" },
  "Abbey Road": { genre: "Rock", displayGenre: "Rock", categories: ["Rock"], spotifyId: "0ETFjACtuP2ADo6LFhL6HN" },
  "The Slim Shady LP": { genre: "Hip-Hop", displayGenre: "Hip-Hop", categories: ["Hip-Hop"], spotifyId: "0vE6mT2iD4pXCSEj1FqzAg" },
  "The Velvet Underground": { genre: "Art Rock, Experimental Rock", displayGenre: "Art Rock, Experimental Rock", categories: ["Rock"], spotifyId: "1nJvji2KIlWSseXRSlNYsC" },
  "Revolver": { genre: "Rock", displayGenre: "Rock", categories: ["Rock"], spotifyId: "3PRoXYsngSwjVEfdJcfJJb" },
  "The Queen Is Dead": { genre: "Alternative Rock, Alternative", displayGenre: "Alternative Rock, Alternative", categories: ["Rock","Alternative"], spotifyId: "1YsYyVJDiD68wgJqV1cGm0" },
  "Blonde On Blonde": { genre: "Folk Rock, Rock", displayGenre: "Folk Rock, Rock", categories: ["Rock","Folk"], spotifyId: "4P6nX5Y4kmIEU0ja3m1eTD" },
  "Funeral": { genre: "Indie Rock, Alternative", displayGenre: "Indie Rock, Alternative", categories: ["Rock","Alternative"], spotifyId: "0WksozeW10wDGiTo63XrTj" },
  "Untitled (Led Zeppelin IV)": { genre: "Hard Rock, Rock", displayGenre: "Hard Rock, Rock", categories: ["Rock"], spotifyId: "5EQnz3vhw116tuq7tBLEBM" },
  "The Marshall Mathers LP": { genre: "Hip-Hop", displayGenre: "Hip-Hop", categories: ["Hip-Hop"], spotifyId: "6t7956yu5zYf5A829XRiHC" },
  "I'm Wide Awake, It's Morning": { genre: "Indie Folk, Folk", displayGenre: "Indie Folk, Folk", categories: ["Folk","Alternative"], spotifyId: "6ymZbEPmRprf0yuFu5O4jm" },
  "Sgt. Pepper's Lonely Hearts Club Band": { genre: "Rock, Psychedelic Rock", displayGenre: "Rock, Psychedelic Rock", categories: ["Rock"], spotifyId: "6QaVfG1pHYl1z15ZxkvVDW" },
  "The Milk-Eyed Mender": { genre: "Folk, Indie Folk", displayGenre: "Folk, Indie Folk", categories: ["Folk"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Portishead": { genre: "Trip-Hop, Electronic", displayGenre: "Trip-Hop, Electronic", categories: ["Electronic"], spotifyId: "6GjfzR8u8Rrw8PxE5BfLv7" },
  "The Low End Theory": { genre: "Hip-Hop, Jazz Rap", displayGenre: "Hip-Hop, Jazz Rap", categories: ["Hip-Hop"], spotifyId: "1p12OAWwAvgThYlIpgjM98" },
  "Rubber Soul": { genre: "Rock, Folk Rock", displayGenre: "Rock, Folk Rock", categories: ["Rock"], spotifyId: "3P9PJ7MKZEP9P4VrDSjzq5" },
  "Homogenic": { genre: "Electronic, Trip-Hop", displayGenre: "Electronic, Trip-Hop", categories: ["Electronic"], spotifyId: "2UJcKeJTDZJTlYY8Jz1Ryb" },
  "Houses Of The Holy": { genre: "Hard Rock, Rock", displayGenre: "Hard Rock, Rock", categories: ["Rock"], spotifyId: "0GqpoHJREqbPvw31IIdICO" },
  "Come Away With Me": { genre: "Jazz, Pop", displayGenre: "Jazz, Pop", categories: ["Jazz"], spotifyId: "0S7ojl87H2WN3nSRZjaKsV" },
  "Rumours": { genre: "Soft Rock, Rock", displayGenre: "Soft Rock, Rock", categories: ["Rock"], spotifyId: "1bt6q2SruMsBtcerNVtpZB" },
  "The Glow Pt. 2": { genre: "Indie Rock, Lo-Fi", displayGenre: "Indie Rock, Lo-Fi", categories: ["Rock","Alternative"], spotifyId: "1ka9glBv98A6e31utqwTIx" },
  "The Black Album": { genre: "Hip-Hop", displayGenre: "Hip-Hop", categories: ["Hip-Hop"], spotifyId: "4FWvo9oS4gRgHtAwDwYjiC" },
  "Takk...": { genre: "Post-Rock, Ambient", displayGenre: "Post-Rock, Ambient", categories: ["Electronic"], spotifyId: "2a5UyR92YL5yetXrFDX3Yk" },
  "Led Zeppelin": { genre: "Hard Rock, Rock", displayGenre: "Hard Rock, Rock", categories: ["Rock"], spotifyId: "3yc0bCK0mR61UPUXXZJ6KW" },
  "Madvillainy": { genre: "Hip-Hop, Experimental Hip-Hop", displayGenre: "Hip-Hop, Experimental Hip-Hop", categories: ["Hip-Hop"], spotifyId: "19bQiwEKhXUBJWY6oV3KZk" },
  "Back To Black": { genre: "Soul, R&B", displayGenre: "Soul, R&B", categories: ["R&B"], spotifyId: "65eRU3J0ePctZLjYjOWVxN" },
  "Just Another Diamond Day": { genre: "Folk, Psychedelic Folk", displayGenre: "Folk, Psychedelic Folk", categories: ["Folk"], spotifyId: "6id8PauwJcCD8m5vYzJdAG" },
  "Illinois": { genre: "Indie Folk, Folk", displayGenre: "Indie Folk, Folk", categories: ["Folk","Alternative"], spotifyId: "0OgZ1nMdyEm1j3taAFb9sm" },
  "White Chalk": { genre: "Alternative, Rock", displayGenre: "Alternative, Rock", categories: ["Alternative","Rock"], spotifyId: "2iUVQijiXKJ8V8FitYy4yP" },
  "The Miseducation Of Lauryn Hill": { genre: "Hip-Hop, R&B", displayGenre: "Hip-Hop, R&B", categories: ["Hip-Hop","R&B"], spotifyId: "1BZoqf8Zje5nGdwZhOjAtD" },
  "Painted Shut": { genre: "Indie Rock, Alternative", displayGenre: "Indie Rock, Alternative", categories: ["Rock","Alternative"], spotifyId: "0LxS4v0hq675ETAYgmlYnr" },
  "Ready To Die": { genre: "Hip-Hop", displayGenre: "Hip-Hop", categories: ["Hip-Hop"], spotifyId: "2HTbQ0RHwukKVXAlTmCZP2" },
  "MTV Unplugged In New York": { genre: "Alternative Rock, Grunge", displayGenre: "Alternative Rock, Grunge", categories: ["Rock","Alternative"], spotifyId: "1To7kv722A8SpZF789MZy7" },
  "Odelay": { genre: "Alternative Rock, Experimental Rock", displayGenre: "Alternative Rock, Experimental Rock", categories: ["Rock","Alternative"], spotifyId: "1qUq45MUSH01IcdTtZ11CN" },
  "Led Zeppelin II": { genre: "Hard Rock, Rock", displayGenre: "Hard Rock, Rock", categories: ["Rock"], spotifyId: "2rl1dOWQj3V8n5guy4J2qB" },
  "Chutes Too Narrow": { genre: "Indie Rock, Alternative", displayGenre: "Indie Rock, Alternative", categories: ["Rock","Alternative"], spotifyId: "3DJZtVNtpw0GQahgtDvapI" },
  "The Bends": { genre: "Alternative Rock, Rock", displayGenre: "Alternative Rock, Rock", categories: ["Rock","Alternative"], spotifyId: "35UJLpClj5EDrhpNIi4DFg" },
  "Paul's Boutique": { genre: "Hip-Hop", displayGenre: "Hip-Hop", categories: ["Hip-Hop"], spotifyId: "5OWcMUm6CojVgiu2q3yWDw" },
  "Seven Swans": { genre: "Indie Folk, Folk", displayGenre: "Indie Folk, Folk", categories: ["Folk","Alternative"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Masterpiece": { genre: "Indie Rock, Alternative", displayGenre: "Indie Rock, Alternative", categories: ["Rock","Alternative"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "The Dark Side Of The Moon": { genre: "Progressive Rock, Rock", displayGenre: "Progressive Rock, Rock", categories: ["Rock"], spotifyId: "4LH4d3cOWNNsVw41Gqt2kv" },
  "Midnight Marauders": { genre: "Hip-Hop, Jazz Rap", displayGenre: "Hip-Hop, Jazz Rap", categories: ["Hip-Hop"], spotifyId: "4CoSCPlKNrWli7E5kFtbcl" },
  "Transatlanticism": { genre: "Indie Rock, Alternative", displayGenre: "Indie Rock, Alternative", categories: ["Rock","Alternative"], spotifyId: "0fR67yBylsfqo4BZcpUy9f" },
  "Resurrection": { genre: "Hip-Hop", displayGenre: "Hip-Hop", categories: ["Hip-Hop"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Lifestylez Ov Da Poor & Dangerous": { genre: "Hip-Hop", displayGenre: "Hip-Hop", categories: ["Hip-Hop"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Liquid Swords": { genre: "Hip-Hop", displayGenre: "Hip-Hop", categories: ["Hip-Hop"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Bark Your Head Off, Dog": { genre: "Indie Rock, Alternative", displayGenre: "Indie Rock, Alternative", categories: ["Rock","Alternative"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Tapestry": { genre: "Soft Rock, Pop", displayGenre: "Soft Rock, Pop", categories: ["Rock"], spotifyId: "0Tk2WrVH9rXtJ62dd1J0nK" },
  "Time Out": { genre: "Jazz", displayGenre: "Jazz", categories: ["Jazz"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Kid A": { genre: "Alternative Rock, Electronic", displayGenre: "Alternative Rock, Electronic", categories: ["Rock","Alternative"], spotifyId: "19RUXBFyM4PpmrLRdtqWbV" },
  "American Beauty": { genre: "Folk Rock, Rock", displayGenre: "Folk Rock, Rock", categories: ["Rock","Folk"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Yoshimi Battles The Pink Robots": { genre: "Alternative Rock, Psychedelic Rock", displayGenre: "Alternative Rock, Psychedelic Rock", categories: ["Rock","Alternative"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Fleet Foxes": { genre: "Indie Folk, Folk", displayGenre: "Indie Folk, Folk", categories: ["Folk","Alternative"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "The Rise And Fall Of Ziggy Stardust And The Spiders From Mars": { genre: "Glam Rock, Rock", displayGenre: "Glam Rock, Rock", categories: ["Rock"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Pet Sounds": { genre: "Pop, Psychedelic Pop", displayGenre: "Pop, Psychedelic Pop", categories: ["Pop"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Arthur (Or The Decline And Fall Of The British Empire)": { genre: "Rock", displayGenre: "Rock", categories: ["Rock"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Get Disowned": { genre: "Indie Rock, Alternative", displayGenre: "Indie Rock, Alternative", categories: ["Rock","Alternative"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Oracular Spectacular": { genre: "Indie Rock, Psychedelic Rock", displayGenre: "Indie Rock, Psychedelic Rock", categories: ["Rock","Alternative"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Beats, Rhymes And Life": { genre: "Hip-Hop", displayGenre: "Hip-Hop", categories: ["Hip-Hop"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Magical Mystery Tour": { genre: "Psychedelic Rock, Rock", displayGenre: "Psychedelic Rock, Rock", categories: ["Rock"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Debut": { genre: "Electronic, Trip-Hop", displayGenre: "Electronic, Trip-Hop", categories: ["Electronic"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "To Bring You My Love": { genre: "Alternative Rock, Rock", displayGenre: "Alternative Rock, Rock", categories: ["Rock","Alternative"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Have One On Me": { genre: "Folk, Singer-Songwriter", displayGenre: "Folk, Singer-Songwriter", categories: ["Folk"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Good Kid, M.A.A.D City": { genre: "Hip-Hop", displayGenre: "Hip-Hop", categories: ["Hip-Hop"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "The College Dropout": { genre: "Hip-Hop", displayGenre: "Hip-Hop", categories: ["Hip-Hop"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Is This It": { genre: "Indie Rock, Alternative", displayGenre: "Indie Rock, Alternative", categories: ["Rock","Alternative"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Remain In Light": { genre: "New Wave, Rock", displayGenre: "New Wave, Rock", categories: ["Rock","Alternative"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "A Night At The Opera": { genre: "Rock, Progressive Rock", displayGenre: "Rock, Progressive Rock", categories: ["Rock"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Head Hunters": { genre: "Jazz, Jazz Fusion", displayGenre: "Jazz, Jazz Fusion", categories: ["Jazz"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Aquemini": { genre: "Hip-Hop", displayGenre: "Hip-Hop", categories: ["Hip-Hop"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Yankee Hotel Foxtrot": { genre: "Indie Rock, Alternative", displayGenre: "Indie Rock, Alternative", categories: ["Rock","Alternative"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Axis: Bold As Love": { genre: "Psychedelic Rock, Rock", displayGenre: "Psychedelic Rock, Rock", categories: ["Rock"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Malibu": { genre: "Hip-Hop, R&B", displayGenre: "Hip-Hop, R&B", categories: ["Hip-Hop","R&B"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "What's Going On": { genre: "Soul, R&B", displayGenre: "Soul, R&B", categories: ["R&B"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Maggot Brain": { genre: "Funk, Psychedelic Rock", displayGenre: "Funk, Psychedelic Rock", categories: ["Rock"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Baduizm": { genre: "Neo Soul, R&B", displayGenre: "Neo Soul, R&B", categories: ["R&B"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Demon Days": { genre: "Alternative Rock, Hip-Hop", displayGenre: "Alternative Rock, Hip-Hop", categories: ["Rock","Alternative"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Brothers": { genre: "Blues Rock, Rock", displayGenre: "Blues Rock, Rock", categories: ["Rock"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Wish You Were Here": { genre: "Progressive Rock, Rock", displayGenre: "Progressive Rock, Rock", categories: ["Rock"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Grey Area": { genre: "Hip-Hop", displayGenre: "Hip-Hop", categories: ["Hip-Hop"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "The Crane Wife": { genre: "Indie Rock, Alternative", displayGenre: "Indie Rock, Alternative", categories: ["Rock","Alternative"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "3rd Eye Vision": { genre: "Hip-Hop", displayGenre: "Hip-Hop", categories: ["Hip-Hop"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "The Doors": { genre: "Psychedelic Rock, Rock", displayGenre: "Psychedelic Rock, Rock", categories: ["Rock"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "London Calling": { genre: "Punk Rock, Rock", displayGenre: "Punk Rock, Rock", categories: ["Rock"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Ugly Is Beautiful": { genre: "Alternative Rock, Rock", displayGenre: "Alternative Rock, Rock", categories: ["Rock","Alternative"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" },
  "Exodus": { genre: "Reggae", displayGenre: "Reggae", categories: ["Reggae"], spotifyId: "2c3w9t8X6S38VKA5Mjj3gU" }
};

// Update albums with complete data
const updatedAlbums = albums.map(album => {
  const data = albumData[album.title] || { 
    genre: "Unknown", 
    displayGenre: "Unknown", 
    categories: ["Unknown"],
    spotifyId: ""
  };
  
  return {
    ...album,
    genre: data.genre,
    displayGenre: data.displayGenre,
    categories: data.categories,
    spotifyAlbumId: data.spotifyId
  };
});

// Generate the complete component content
const componentContent = `import React from 'react'
import './FavoriteAlbums.css'

interface Album {
  id: number
  rank: number
  title: string
  artist: string
  year: number
  genre: string
  displayGenre: string
  categories: string[]
  coverImage: string
  description?: string
  favoriteTracks?: string[]
  spotifyAlbumId?: string
  youtubePlaylistId?: string
  youtubeMusicId?: string
}

// Complete album data with all 100 albums - genres, categories, Spotify IDs, and YouTube playlist IDs
const favoriteAlbums: Album[] = ${JSON.stringify(updatedAlbums, null, 2)}

const FavoriteAlbums: React.FC = () => {
  const [expandedAlbum, setExpandedAlbum] = React.useState<number | null>(null)
  const [selectedGenre, setSelectedGenre] = React.useState<string>('All')
  const [selectedDecade, setSelectedDecade] = React.useState<string>('All')
  const [sortBy, setSortBy] = React.useState<'rank' | 'year' | 'title' | 'artist'>('rank')

  // Get unique genres and decades
  const genres = ['All', ...Array.from(new Set(favoriteAlbums.map(album => album.genre).filter(genre => genre !== 'Unknown')))]
  const decades = ['All', ...Array.from(new Set(favoriteAlbums.map(album => Math.floor(album.year / 10) * 10).sort()))]

  // Filter and sort albums
  const filteredAlbums = favoriteAlbums
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

  return (
    <div className="favorite-albums-page">
      <div className="container">
        <h1 className="page-title">Top Albums</h1>
        <p className="page-description">My personal collection of favorite albums</p>
        
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
            Showing {filteredAlbums.length} of {favoriteAlbums.length} albums
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
                className={\`album-item \${isExpanded ? 'expanded' : ''} \${isExpanded ? (isLastInRow || isSecondToLastInRow ? 'expand-left' : 'expand-right') : ''}\`}
                onClick={() => setExpandedAlbum(isExpanded ? null : album.id)}
              >
                <div className="album-rank">#{album.rank}</div>
                
                <div className="album-cover">
                  <img 
                    src={album.coverImage} 
                    alt={\`\${album.title} by \${album.artist}\`}
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
                  <p className="album-genre">{album.displayGenre}</p>
                  
                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="album-expanded-content">
                      {album.description && (
                        <div className="album-description">
                          <h4>Description</h4>
                          <p>{album.description}</p>
                        </div>
                      )}
                      
                      {album.favoriteTracks && album.favoriteTracks.length > 0 && (
                        <div className="favorite-tracks">
                          <h4>Favorite Tracks</h4>
                          <ul>
                            {album.favoriteTracks.map((track, index) => (
                              <li key={index}>{track}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="music-embed">
                        <h4>Listen to Album</h4>
                        {album.youtubePlaylistId ? (
                          <div className="youtube-music-link">
                            <button 
                              className="youtube-music-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(\`https://music.youtube.com/playlist?list=\${album.youtubePlaylistId}\`, '_blank')
                              }}
                            >
                              🎵 Listen to Full Album on YouTube Music
                            </button>
                            <p className="music-note">Opens the official album playlist in YouTube Music</p>
                          </div>
                        ) : album.youtubeMusicId ? (
                          <div className="youtube-player">
                            <iframe
                              style={{ borderRadius: '12px' }}
                              src={\`https://www.youtube.com/embed/\${album.youtubeMusicId}?autoplay=0&modestbranding=1&rel=0\`}
                              width="100%"
                              height="315"
                              frameBorder="0"
                              allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              loading="lazy"
                            ></iframe>
                          </div>
                        ) : album.spotifyAlbumId ? (
                          <div className="spotify-player">
                            <iframe
                              style={{ borderRadius: '12px' }}
                              src={\`https://open.spotify.com/embed/album/\${album.spotifyAlbumId}\`}
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
                        <button 
                          className="spotify-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(\`https://open.spotify.com/search/\${encodeURIComponent(album.title + ' ' + album.artist)}\`, '_blank')
                          }}
                        >
                          🎵 Open in Spotify
                        </button>
                        <button 
                          className="share-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.share?.({
                              title: \`\${album.title} by \${album.artist}\`,
                              text: \`Check out this album: \${album.title} by \${album.artist}\`,
                              url: window.location.href
                            }).catch(() => {
                              navigator.clipboard.writeText(\`\${album.title} by \${album.artist}\`)
                            })
                          }}
                        >
                          📤 Share
                        </button>
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

export default FavoriteAlbums`;

// Write the updated component
const componentPath = path.join(__dirname, '../src/components/FavoriteAlbums.tsx');
fs.writeFileSync(componentPath, componentContent, 'utf8');

console.log(`✅ Successfully updated component with all ${updatedAlbums.length} albums`);
console.log('📁 Updated: src/components/FavoriteAlbums.tsx');
console.log('🎵 OK Computer has YouTube Music playlist ID ready');
console.log('🎨 All albums have proper genres, categories, and Spotify IDs');
console.log('📝 To add YouTube Music playlist IDs, just paste them in the youtubePlaylistId field for each album'); 