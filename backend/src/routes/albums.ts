import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Use the global Request interface with user property from auth middleware

// GET /api/albums - Get user's ranked albums (requires login)
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Get albums with user's rankings
    const query = `
      SELECT 
        a.*,
        uar.rank,
        uar.personal_notes
      FROM albums a
      JOIN user_album_rankings uar ON a.id = uar.album_id
      WHERE uar.user_id = $1
      ORDER BY uar.rank ASC
    `;
    
    const result = await pool.query(query, [userId]);
    
    res.json({
      albums: result.rows
    });
  } catch (error: any) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/albums/global - Get all albums in database (admin only)
router.get('/global', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const query = 'SELECT * FROM albums ORDER BY title, artist';
    const result = await pool.query(query);
    
    res.json({
      albums: result.rows
    });
  } catch (error: any) {
    console.error('Error fetching global albums:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/albums - Add new album to global database (admin only)
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      title, 
      artist, 
      year, 
      genre, 
      displayGenre,
      categories = [],
      coverImage,
      description,
      youtubePlaylistId,
      spotifyAlbumId
    } = req.body;
    
    if (!title || !artist || !year) {
      res.status(400).json({ error: 'Title, artist, and year are required' });
      return;
    }
    
    const query = `
      INSERT INTO albums (
        title, artist, year, genre, display_genre, categories, 
        cover_image, description, youtube_playlist_id, spotify_album_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      title,
      artist,
      year,
      genre,
      displayGenre || genre,
      JSON.stringify(categories),
      coverImage,
      description,
      youtubePlaylistId,
      spotifyAlbumId
    ]);
    
    res.json({
      message: 'Album added successfully',
      album: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error adding album:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/albums/:id/rank - Update user's ranking for an album
router.put('/:id/rank', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const albumId = parseInt(req.params.id);
    const { rank, personalNotes } = req.body;
    
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    
    if (!rank || rank < 1) {
      res.status(400).json({ error: 'Valid rank is required' });
      return;
    }
    
    // Check if album exists
    const albumCheck = await pool.query('SELECT id FROM albums WHERE id = $1', [albumId]);
    if (albumCheck.rows.length === 0) {
      res.status(404).json({ error: 'Album not found' });
      return;
    }
    
    // Update or insert ranking
    const query = `
      INSERT INTO user_album_rankings (user_id, album_id, rank, personal_notes)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, album_id) 
      DO UPDATE SET 
        rank = EXCLUDED.rank,
        personal_notes = EXCLUDED.personal_notes,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, albumId, rank, personalNotes]);
    
    res.json({
      message: 'Album ranking updated successfully',
      ranking: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error updating album ranking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/albums/reorder - Reorder user's album rankings
router.put('/reorder', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { rankings } = req.body; // Array of { albumId, rank }
    
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    
    if (!rankings || !Array.isArray(rankings)) {
      res.status(400).json({ error: 'Rankings array is required' });
      return;
    }
    
    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // First, set all ranks to negative values to avoid unique constraint violations
      for (let i = 0; i < rankings.length; i++) {
        const { albumId } = rankings[i];
        await client.query(`
          UPDATE user_album_rankings 
          SET rank = $1, updated_at = CURRENT_TIMESTAMP 
          WHERE user_id = $2 AND album_id = $3
        `, [-(i + 1), userId, albumId]);
      }
      
      // Then, update to the final rank values
      for (let i = 0; i < rankings.length; i++) {
        const { albumId, rank } = rankings[i];
        await client.query(`
          UPDATE user_album_rankings 
          SET rank = $1, updated_at = CURRENT_TIMESTAMP 
          WHERE user_id = $2 AND album_id = $3
        `, [rank, userId, albumId]);
      }
      
      await client.query('COMMIT');
      
      res.json({
        message: 'Albums reordered successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error reordering albums:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/albums/available - Get all available albums (excluding user's existing ones)
router.get('/available', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    
    const query = `
      SELECT a.* 
      FROM albums a
      WHERE NOT EXISTS (
        SELECT 1 FROM user_album_rankings uar 
        WHERE uar.album_id = a.id AND uar.user_id = $1
      )
      ORDER BY a.title, a.artist
    `;
    
    const result = await pool.query(query, [userId]);
    
    res.json({
      albums: result.rows
    });
  } catch (error: any) {
    console.error('Error fetching available albums:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/albums/search - Search albums by artist and title
router.get('/search', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { artist, title } = req.query;
    
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    
    if (!artist && !title) {
      res.status(400).json({ error: 'At least one search term (artist or title) is required' });
      return;
    }
    
    let query = `
      SELECT a.* 
      FROM albums a
      WHERE NOT EXISTS (
        SELECT 1 FROM user_album_rankings uar 
        WHERE uar.album_id = a.id AND uar.user_id = $1
      )
    `;
    const params: any[] = [userId];
    let paramIndex = 2;
    
    if (artist) {
      query += ` AND LOWER(a.artist) LIKE LOWER($${paramIndex})`;
      params.push(`%${artist}%`);
      paramIndex++;
    }
    
    if (title) {
      query += ` AND LOWER(a.title) LIKE LOWER($${paramIndex})`;
      params.push(`%${title}%`);
      paramIndex++;
    }
    
    query += ' ORDER BY a.title, a.artist LIMIT 20';
    
    const result = await pool.query(query, params);
    
    res.json({
      albums: result.rows
    });
  } catch (error: any) {
    console.error('Error searching albums:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/albums/:id/add - Add album to user's list
router.post('/:id/add', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const albumId = parseInt(req.params.id);
    
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    
    // Check if album exists
    const albumCheck = await pool.query('SELECT id FROM albums WHERE id = $1', [albumId]);
    if (albumCheck.rows.length === 0) {
      res.status(404).json({ error: 'Album not found' });
      return;
    }
    
    // Check if user already has this album
    const existingCheck = await pool.query(
      'SELECT id FROM user_album_rankings WHERE user_id = $1 AND album_id = $2',
      [userId, albumId]
    );
    
    if (existingCheck.rows.length > 0) {
      res.status(400).json({ error: 'Album already in your list' });
      return;
    }
    
    // Get the next available rank
    const rankResult = await pool.query(
      'SELECT COALESCE(MAX(rank), 0) + 1 as next_rank FROM user_album_rankings WHERE user_id = $1',
      [userId]
    );
    const nextRank = rankResult.rows[0].next_rank;
    
    // Add album to user's list
    const insertResult = await pool.query(
      `INSERT INTO user_album_rankings (user_id, album_id, rank, personal_notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, albumId, nextRank, '']
    );
    
    res.json({
      message: 'Album added to your list successfully',
      ranking: insertResult.rows[0]
    });
  } catch (error: any) {
    console.error('Error adding album to user list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/albums/:id/remove - Remove album from user's list
router.delete('/:id/remove', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const albumId = parseInt(req.params.id);
    
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    
    // Check if user has this album in their list
    const existingCheck = await pool.query(
      'SELECT id FROM user_album_rankings WHERE user_id = $1 AND album_id = $2',
      [userId, albumId]
    );
    
    if (existingCheck.rows.length === 0) {
      res.status(404).json({ error: 'Album not found in your list' });
      return;
    }
    
    // Remove album from user's list
    await pool.query(
      'DELETE FROM user_album_rankings WHERE user_id = $1 AND album_id = $2',
      [userId, albumId]
    );
    
    res.json({
      message: 'Album removed from your list successfully'
    });
  } catch (error: any) {
    console.error('Error removing album from user list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
