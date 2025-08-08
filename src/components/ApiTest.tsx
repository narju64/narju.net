import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../utils/api';

interface Album {
  id: number;
  rank: number;
  title: string;
  artist: string;
  year: number;
  genre: string;
  categories: string[];
  coverImage?: string;
  description?: string;
  spotifyAlbumId?: string;
  youtubePlaylistId?: string;
}

interface ApiResponse {
  list: {
    id: number;
    name: string;
    category: string;
    items_json: Album[];
  };
}

const ApiTest: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(buildApiUrl('/api/lists/albums'));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ApiResponse = await response.json();
        setAlbums(data.list.items_json);
      } catch (err) {
        console.error('Error fetching albums:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  if (loading) {
    return <div>Loading albums from API...</div>;
  }

  if (error) {
    return <div>Error loading albums: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>API Test - Albums from Database</h2>
      <p>Found {albums.length} albums in the database</p>
      
      <div style={{ marginTop: '20px' }}>
        {albums.map((album) => (
          <div key={album.id} style={{ 
            border: '1px solid #ccc', 
            padding: '10px', 
            margin: '10px 0',
            borderRadius: '5px'
          }}>
            <h3>{album.rank}. {album.title}</h3>
            <p><strong>Artist:</strong> {album.artist}</p>
            <p><strong>Year:</strong> {album.year}</p>
            <p><strong>Genre:</strong> {album.genre}</p>
            <p><strong>Categories:</strong> {album.categories?.join(', ') || 'None'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiTest;
