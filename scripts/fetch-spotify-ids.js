import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
require('dotenv').config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Spotify API credentials
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing Spotify API credentials. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your .env file.');
  process.exit(1);
}

let accessToken = null;

async function getAccessToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}

async function searchSpotifyAlbum(artist, title) {
  if (!accessToken) {
    accessToken = await getAccessToken();
  }

  const query = `${artist} ${title}`;
  const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=1`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  
  if (data.albums && data.albums.items.length > 0) {
    const album = data.albums.items[0];
    // Check if the artist matches (case insensitive)
    const artistMatch = album.artists.some(a => 
      a.name.toLowerCase().includes(artist.toLowerCase()) || 
      artist.toLowerCase().includes(a.name.toLowerCase())
    );
    
    if (artistMatch) {
      return album.id;
    }
  }
  
  return null;
}

async function updateSpotifyIds() {
  // Read the current component file
  const componentPath = path.join(__dirname, '../src/components/FavoriteAlbums.tsx');
  let content = fs.readFileSync(componentPath, 'utf8');

  // Extract album data using regex
  const albumRegex = /\{\s*"id":\s*(\d+),\s*"rank":\s*(\d+),\s*"title":\s*"([^"]+)",\s*"artist":\s*"([^"]+)",\s*"year":\s*(\d+),[\s\S]*?"spotifyAlbumId":\s*"([^"]*)"[\s\S]*?\}/g;
  
  let match;
  let updatedContent = content;
  let updateCount = 0;

  console.log('Starting Spotify ID update...\n');

  while ((match = albumRegex.exec(content)) !== null) {
    const [fullMatch, id, rank, title, artist, year, currentSpotifyId] = match;
    
    // Update all albums to ensure we get correct Spotify IDs
    // Only skip if it's an artist known to not be on Spotify (like Joanna Newsom)
    if (artist.toLowerCase().includes('joanna newsom')) {
      console.log(`Skipping ${rank}. ${title} by ${artist} - not available on Spotify`);
      continue;
    }

    console.log(`Searching for ${rank}. ${title} by ${artist}...`);
    
    try {
      const spotifyId = await searchSpotifyAlbum(artist, title);
      
      if (spotifyId) {
        // Replace the spotifyAlbumId in the content
        const newSpotifyId = `"spotifyAlbumId": "${spotifyId}"`;
        const oldSpotifyId = `"spotifyAlbumId": "${currentSpotifyId}"`;
        
        updatedContent = updatedContent.replace(oldSpotifyId, newSpotifyId);
        console.log(`✓ Found Spotify ID: ${spotifyId}`);
        updateCount++;
      } else {
        console.log(`✗ No Spotify ID found`);
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.log(`✗ Error searching for ${title}: ${error.message}`);
    }
  }

  // Write the updated content back to the file
  fs.writeFileSync(componentPath, updatedContent, 'utf8');
  
  console.log(`\nUpdate complete! Updated ${updateCount} albums.`);
  console.log('Note: Some artists (like Joanna Newsom) are not available on Spotify and will remain empty.');
}

// Check if credentials are provided
if (CLIENT_ID === 'YOUR_CLIENT_ID' || CLIENT_SECRET === 'YOUR_CLIENT_SECRET') {
  console.log('Please update the CLIENT_ID and CLIENT_SECRET variables in this script with your Spotify API credentials.');
  console.log('You can get these from: https://developer.spotify.com/dashboard');
} else {
  updateSpotifyIds().catch(console.error);
} 