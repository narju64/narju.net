import { Router, Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

// GET /api/users/:username/profile - Get user's public profile
router.get('/:username/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    // Get user profile data (public information only)
    const userQuery = 'SELECT id, username, created_at FROM users WHERE username = $1';
    const userResult = await pool.query(userQuery, [username]);

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = userResult.rows[0];

    res.json({
      id: user.id,
      username: user.username,
      created_at: user.created_at
    });

  } catch (error: any) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
