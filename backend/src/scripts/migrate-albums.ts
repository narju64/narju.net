import pool from '../config/database';
import { testConnection } from '../config/database';

const migrateAlbums = async () => {
  try {
    console.log('🚀 Starting albums migration...');
    
    // Test database connection first
    const connection = await testConnection();
    if (!connection.success) {
      throw new Error('Database connection failed');
    }
    
    console.log('✅ Database connection successful');
    
    // Import albums data
    const { albumsData } = await import('../data/albums-data');
    console.log(`📀 Found ${albumsData.length} albums to process`);
    
    // Check how many albums are already in the database
    const existingCount = await pool.query('SELECT COUNT(*) FROM albums');
    console.log(`📊 Current albums in database: ${existingCount.rows[0].count}`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    // Migrate albums
    for (const album of albumsData) {
      try {
        // Check if album already exists
        const existing = await pool.query(
          'SELECT id FROM albums WHERE title = $1 AND artist = $2 AND year = $3',
          [album.title, album.artist, album.year]
        );
        
        if (existing.rows.length > 0) {
          console.log(`⏭️  Skipping existing: ${album.title} by ${album.artist} (${album.year})`);
          skippedCount++;
          continue;
        }
        
        // Insert new album
        await pool.query(`
          INSERT INTO albums (
            title, artist, year, genre, display_genre, categories, 
            cover_image, description, youtube_playlist_id, spotify_album_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          album.title,
          album.artist,
          album.year,
          album.genre || '',
          album.displayGenre || album.genre || '',
          JSON.stringify(album.categories || []),
          album.coverImage || '',
          '', // No description field in current data
          album.youtubePlaylistId || '',
          album.spotifyAlbumId || ''
        ]);
        
        console.log(`✅ Added: ${album.title} by ${album.artist} (${album.year})`);
        addedCount++;
        
      } catch (error) {
        console.error(`❌ Error adding ${album.title} by ${album.artist}:`, error);
      }
    }
    
    // Final summary
    const finalCount = await pool.query('SELECT COUNT(*) FROM albums');
    console.log('\n🎉 Albums migration completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Albums processed: ${albumsData.length}`);
    console.log(`   - New albums added: ${addedCount}`);
    console.log(`   - Albums skipped (already exist): ${skippedCount}`);
    console.log(`   - Total albums in database: ${finalCount.rows[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Albums migration failed:', error);
    process.exit(1);
  }
};

migrateAlbums();
