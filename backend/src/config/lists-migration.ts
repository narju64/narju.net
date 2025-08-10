import pool from './database';

// Create just the lists-related tables for multi-user support
export const createListsTables = async () => {
  try {
    console.log('🔄 Creating lists database structure...');

    // 1. Albums table (content without ranks)
    const albumsTableQuery = `
      CREATE TABLE IF NOT EXISTS albums (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255) NOT NULL,
        year INTEGER NOT NULL,
        genre VARCHAR(255),
        display_genre VARCHAR(255),
        categories JSONB DEFAULT '[]',
        cover_image VARCHAR(500),
        description TEXT,
        youtube_playlist_id VARCHAR(255),
        spotify_album_id VARCHAR(255),
        youtube_music_id VARCHAR(255),
        favorite_tracks JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(albumsTableQuery);
    console.log('✅ Albums table created');

    // 2. NBA Players table (content without ranks)
    const playersTableQuery = `
      CREATE TABLE IF NOT EXISTS nba_players (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        era VARCHAR(100),
        nationality VARCHAR(100),
        position VARCHAR(10),
        teams JSONB DEFAULT '[]',
        photo VARCHAR(500),
        height VARCHAR(20),
        weight VARCHAR(20),
        wingspan VARCHAR(20),
        stats JSONB,
        achievements JSONB,
        peak_season JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(playersTableQuery);
    console.log('✅ NBA Players table created');

    // 3. User rankings tables
    const userAlbumRankingsQuery = `
      CREATE TABLE IF NOT EXISTS user_album_rankings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        album_id INTEGER REFERENCES albums(id) ON DELETE CASCADE,
        rank INTEGER NOT NULL,
        personal_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, album_id),
        UNIQUE(user_id, rank)
      );
    `;
    await pool.query(userAlbumRankingsQuery);
    console.log('✅ User Album Rankings table created');

    const userNbaRankingsQuery = `
      CREATE TABLE IF NOT EXISTS user_nba_rankings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        player_id INTEGER REFERENCES nba_players(id) ON DELETE CASCADE,
        rank INTEGER NOT NULL,
        personal_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, player_id),
        UNIQUE(user_id, rank)
      );
    `;
    await pool.query(userNbaRankingsQuery);
    console.log('✅ User NBA Rankings table created');

    console.log('🎉 Lists database structure created successfully!');
  } catch (error) {
    console.error('❌ Error creating lists tables:', error);
    throw error;
  }
};

// Migrate existing lists data from the old structure to new structure
export const migrateListsData = async () => {
  try {
    console.log('🔄 Migrating lists data to new structure...');

    // Import data from backup files
    const { albumsData } = await import('../data/albums-data');
    const { nbaPlayersData } = await import('../data/nba-players-data');

    // 1. Migrate albums (current structure doesn't have rank)
    console.log('📀 Migrating albums...');
    for (const album of albumsData) {
      // Handle albums that might not have all fields
      const albumData = {
        title: album.title,
        artist: album.artist,
        year: album.year,
        genre: album.genre || '',
        displayGenre: album.displayGenre || album.genre || '',
        categories: album.categories || [],
        coverImage: album.coverImage || '',
        description: '', // No description field in current data
        youtubePlaylistId: album.youtubePlaylistId || '',
        spotifyAlbumId: album.spotifyAlbumId || ''
      };
      
      await pool.query(`
        INSERT INTO albums (
          title, artist, year, genre, display_genre, categories, 
          cover_image, description, youtube_playlist_id, spotify_album_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (title, artist, year) DO NOTHING
      `, [
        albumData.title,
        albumData.artist,
        albumData.year,
        albumData.genre,
        albumData.displayGenre,
        JSON.stringify(albumData.categories),
        albumData.coverImage,
        albumData.description,
        albumData.youtubePlaylistId,
        albumData.spotifyAlbumId
      ]);
    }

    // 2. Migrate NBA players (current structure doesn't have rank)
    console.log('🏀 Migrating NBA players...');
    for (const player of nbaPlayersData) {
      // Handle players that might not have all fields
      const playerData = {
        name: player.name,
        era: player.era || '',
        nationality: player.nationality || '',
        position: player.position || '',
        teams: player.teams || [],
        photo: player.photo || '',
        height: player.height || '',
        weight: player.weight || '',
        wingspan: player.wingspan || '',
        stats: player.stats || {},
        achievements: player.achievements || [],
        peakSeason: player.peakSeason || {}
      };
      
      await pool.query(`
        INSERT INTO nba_players (
          name, era, nationality, position, teams, photo, height, weight, 
          wingspan, stats, achievements, peak_season
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (name) DO NOTHING
      `, [
        playerData.name,
        playerData.era,
        playerData.nationality,
        playerData.position,
        JSON.stringify(playerData.teams),
        playerData.photo,
        playerData.height,
        playerData.weight,
        playerData.wingspan,
        JSON.stringify(playerData.stats),
        JSON.stringify(playerData.achievements),
        JSON.stringify(playerData.peakSeason)
      ]);
    }

    console.log('🎉 Lists data migration completed successfully!');
  } catch (error) {
    console.error('❌ Error migrating lists data:', error);
    throw error;
  }
};

// Run the lists migration
export const runListsMigration = async () => {
  try {
    await createListsTables();
    await migrateListsData();
    console.log('✅ Lists migration completed successfully!');
  } catch (error) {
    console.error('❌ Lists migration failed:', error);
    throw error;
  }
};
