import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Use the global Request interface with user property from auth middleware

// GET /api/nba-players - Get user's ranked NBA players (requires login)
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Get players with user's rankings
    const query = `
      SELECT 
        p.*,
        unr.rank,
        unr.personal_notes
      FROM nba_players p
      JOIN user_nba_rankings unr ON p.id = unr.player_id
      WHERE unr.user_id = $1
      ORDER BY unr.rank ASC
    `;
    
    const result = await pool.query(query, [userId]);
    
    res.json({
      players: result.rows
    });
  } catch (error: any) {
    console.error('Error fetching NBA players:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/nba-players/global - Get all NBA players in database (admin only)
router.get('/global', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const query = 'SELECT * FROM nba_players ORDER BY name';
    const result = await pool.query(query);
    
    res.json({
      players: result.rows
    });
  } catch (error: any) {
    console.error('Error fetching global NBA players:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/nba-players - Add new NBA player to global database (admin only)
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      name, 
      era, 
      nationality, 
      position,
      teams = [],
      photo,
      height,
      weight,
      wingspan,
      stats = {},
      achievements = [],
      peakSeason = {}
    } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    
    const query = `
      INSERT INTO nba_players (
        name, era, nationality, position, teams, photo, height, weight, 
        wingspan, stats, achievements, peak_season
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      name,
      era,
      nationality,
      position,
      JSON.stringify(teams),
      photo,
      height,
      weight,
      wingspan,
      JSON.stringify(stats),
      JSON.stringify(achievements),
      JSON.stringify(peakSeason)
    ]);
    
    res.json({
      message: 'NBA player added successfully',
      player: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error adding NBA player:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/nba-players/:id/rank - Update user's ranking for an NBA player
router.put('/:id/rank', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const playerId = parseInt(req.params.id);
    const { rank, personalNotes } = req.body;
    
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    
    if (!rank || rank < 1) {
      res.status(400).json({ error: 'Valid rank is required' });
      return;
    }
    
    // Check if player exists
    const playerCheck = await pool.query('SELECT id FROM nba_players WHERE id = $1', [playerId]);
    if (playerCheck.rows.length === 0) {
      res.status(404).json({ error: 'NBA player not found' });
      return;
    }
    
    // Update or insert ranking
    const query = `
      INSERT INTO user_nba_rankings (user_id, player_id, rank, personal_notes)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, player_id) 
      DO UPDATE SET 
        rank = EXCLUDED.rank,
        personal_notes = EXCLUDED.personal_notes,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, playerId, rank, personalNotes]);
    
    res.json({
      message: 'NBA player ranking updated successfully',
      ranking: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error updating NBA player ranking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/nba-players/reorder - Reorder user's NBA player rankings
router.put('/reorder', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { rankings } = req.body; // Array of { playerId, rank }
    
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
      
      // Update all rankings
      for (const { playerId, rank } of rankings) {
        await client.query(`
          UPDATE user_nba_rankings 
          SET rank = $1, updated_at = CURRENT_TIMESTAMP 
          WHERE user_id = $2 AND player_id = $3
        `, [rank, userId, playerId]);
      }
      
      await client.query('COMMIT');
      
      res.json({
        message: 'NBA players reordered successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error reordering NBA players:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
