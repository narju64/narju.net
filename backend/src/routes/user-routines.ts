import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/users/:userId/routines - Get user's routine
router.get('/:userId/routines', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUserId = (req as any).user?.id; // From auth middleware
    
    console.log('GET /api/users/:userId/routines called');
    console.log('Requested userId:', userId);
    console.log('Authenticated userId:', requestingUserId);
    
    // Users can only access their own routines
    if (parseInt(userId) !== requestingUserId) {
      console.log('Access denied - userId mismatch');
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    const query = `
      SELECT * FROM user_routines 
      WHERE user_id = $1 AND is_active = true 
      ORDER BY day_number, time_slot
    `;
    
    console.log('Executing query with userId:', userId);
    const result = await pool.query(query, [userId]);
    console.log('Query result rows:', result.rows.length);
    
    // Transform data to match the expected format
    const routinesByDay: { [key: number]: any[] } = {};
    
    // Initialize all 7 days
    for (let day = 1; day <= 7; day++) {
      routinesByDay[day] = [];
    }
    
    // Populate with actual data
    result.rows.forEach(row => {
      const dayNumber = row.day_number;
      if (!routinesByDay[dayNumber]) {
        routinesByDay[dayNumber] = [];
      }
      
      routinesByDay[dayNumber].push({
        time: row.time_slot,
        activity: row.activity,
        category: row.category
      });
    });
    
    // Convert to array format expected by frontend
    const formattedRoutines = Object.entries(routinesByDay).map(([day, routines]) => ({
      day: parseInt(day),
      routines: routines
    }));
    
    console.log('Sending response with routines:', formattedRoutines);
    
    res.json({
      routines: formattedRoutines
    });
  } catch (error: any) {
    console.error('Error fetching user routines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users/:userId/routines - Create new routine item
router.post('/:userId/routines', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUserId = (req as any).user?.id;
    
    if (parseInt(userId) !== requestingUserId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    const { day_number, time_slot, activity, category } = req.body;
    
    if (!day_number || !time_slot || !activity || !category) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }
    
    if (day_number < 1 || day_number > 7) {
      res.status(400).json({ error: 'Day number must be between 1 and 7' });
      return;
    }
    
    const query = `
      INSERT INTO user_routines (user_id, day_number, time_slot, activity, category)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, day_number, time_slot, activity, category]);
    
    res.status(201).json({
      message: 'Routine item created successfully',
      routine: result.rows[0]
    });
  } catch (error: any) {
    if (error.code === '23505') { // Unique constraint violation
      res.status(409).json({ error: 'A routine already exists for this day and time' });
      return;
    }
    console.error('Error creating routine item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/:userId/routines/:id - Update routine item
router.put('/:userId/routines/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, id } = req.params;
    const requestingUserId = (req as any).user?.id;
    
    if (parseInt(userId) !== requestingUserId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    const { day_number, time_slot, activity, category, is_active } = req.body;
    
    // First check if the routine item belongs to the user
    const checkQuery = 'SELECT * FROM user_routines WHERE id = $1 AND user_id = $2';
    const checkResult = await pool.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: 'Routine item not found' });
      return;
    }
    
    const updateQuery = `
      UPDATE user_routines 
      SET day_number = $1, time_slot = $2, activity = $3, category = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 AND user_id = $7
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [
      day_number || checkResult.rows[0].day_number,
      time_slot || checkResult.rows[0].time_slot,
      activity || checkResult.rows[0].activity,
      category || checkResult.rows[0].category,
      is_active !== undefined ? is_active : checkResult.rows[0].is_active,
      id,
      userId
    ]);
    
    res.json({
      message: 'Routine item updated successfully',
      routine: result.rows[0]
    });
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'A routine already exists for this day and time' });
      return;
    }
    console.error('Error updating routine item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// POST /api/users/:userId/routines/upsert - Create or update routine item
router.post('/:userId/routines/upsert', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUserId = (req as any).user?.id;
    
    if (parseInt(userId) !== requestingUserId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    const { day_number, time_slot, activity, category } = req.body;
    
    if (!day_number || !time_slot || !activity || !category) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }
    
    if (day_number < 1 || day_number > 7) {
      res.status(400).json({ error: 'Day number must be between 1 and 7' });
      return;
    }
    
    // Use UPSERT (INSERT ... ON CONFLICT DO UPDATE)
    const query = `
      INSERT INTO user_routines (user_id, day_number, time_slot, activity, category, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, day_number, time_slot) 
      DO UPDATE SET 
        activity = EXCLUDED.activity,
        category = EXCLUDED.category,
        updated_at = CURRENT_TIMESTAMP,
        is_active = true
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, day_number, time_slot, activity, category]);
    
    res.json({
      message: 'Routine item saved successfully',
      routine: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error upserting routine item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users/:userId/routines/bulk-upsert - Create or update multiple routine items
router.post('/:userId/routines/bulk-upsert', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUserId = (req as any).user?.id;
    
    if (parseInt(userId) !== requestingUserId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    const { routines } = req.body;
    
    if (!routines || !Array.isArray(routines)) {
      res.status(400).json({ error: 'Routines array is required' });
      return;
    }
    
    // Validate all routines
    for (const routine of routines) {
      const { day_number, time_slot, activity, category } = routine;
      if (!day_number || !time_slot || !activity) {
        res.status(400).json({ error: 'Day number, time slot, and activity are required for each routine' });
        return;
      }
      if (day_number < 1 || day_number > 7) {
        res.status(400).json({ error: 'Day number must be between 1 and 7' });
        return;
      }
    }
    
    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const results = [];
      
      for (const routine of routines) {
        const { day_number, time_slot, activity, category } = routine;
        
        // Provide default category if none specified
        const finalCategory = category || 'other';
        
        const query = `
          INSERT INTO user_routines (user_id, day_number, time_slot, activity, category, updated_at)
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
          ON CONFLICT (user_id, day_number, time_slot) 
          DO UPDATE SET 
            activity = EXCLUDED.activity,
            category = EXCLUDED.category,
            updated_at = CURRENT_TIMESTAMP,
            is_active = true
          RETURNING *
        `;
        
        const result = await client.query(query, [userId, day_number, time_slot, activity, finalCategory]);
        results.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      
      res.json({
        message: `${results.length} routine items saved successfully`,
        routines: results
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error bulk upserting routines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/users/:userId/routines/delete - Delete multiple routine items
router.delete('/:userId/routines/delete', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUserId = (req as any).user?.id;
    
    if (parseInt(userId) !== requestingUserId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    const { routines } = req.body;
    
    if (!routines || !Array.isArray(routines)) {
      res.status(400).json({ error: 'Routines array is required' });
      return;
    }
    
    // Validate all routines
    for (const routine of routines) {
      const { day_number, time_slot } = routine;
      if (!day_number || !time_slot) {
        res.status(400).json({ error: 'Day number and time slot are required for each routine' });
        return;
      }
    }
    
    // Use a transaction to ensure all deletions succeed or fail together
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Delete each routine by day_number and time_slot
      for (const routine of routines) {
        const { day_number, time_slot } = routine;
        
        const deleteQuery = `
          DELETE FROM user_routines 
          WHERE user_id = $1 AND day_number = $2 AND time_slot = $3
        `;
        
        const result = await client.query(deleteQuery, [userId, day_number, time_slot]);
        
        if (result.rowCount === 0) {
          console.warn(`No routine found to delete for day ${day_number} at ${time_slot}`);
        }
      }
      
      await client.query('COMMIT');
      
      res.json({
        message: `Successfully deleted ${routines.length} routine(s)`,
        deletedCount: routines.length
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error deleting routines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:userId/routines/deleted-timeslots - Get user's deleted timeslots
router.get('/:userId/routines/deleted-timeslots', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUserId = (req as any).user?.id;
    
    if (parseInt(userId) !== requestingUserId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    const query = `
      SELECT time_slot 
      FROM user_deleted_timeslots 
      WHERE user_id = $1 
      ORDER BY time_slot
    `;
    
    const result = await pool.query(query, [userId]);
    
    res.json({
      deletedTimeslots: result.rows.map(row => row.time_slot)
    });
  } catch (error: any) {
    console.error('Error fetching deleted timeslots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users/:userId/routines/deleted-timeslots - Add timeslots to deleted list
router.post('/:userId/routines/deleted-timeslots', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUserId = (req as any).user?.id;
    
    if (parseInt(userId) !== requestingUserId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    const { timeslots } = req.body;
    
    if (!timeslots || !Array.isArray(timeslots)) {
      res.status(400).json({ error: 'Timeslots array is required' });
      return;
    }
    
    // Use a transaction to ensure all insertions succeed or fail together
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert each deleted timeslot
      for (const timeslot of timeslots) {
        const insertQuery = `
          INSERT INTO user_deleted_timeslots (user_id, time_slot)
          VALUES ($1, $2)
          ON CONFLICT (user_id, time_slot) DO NOTHING
        `;
        
        await client.query(insertQuery, [userId, timeslot]);
      }
      
      await client.query('COMMIT');
      
      res.json({
        message: `Successfully marked ${timeslots.length} timeslot(s) as deleted`,
        addedCount: timeslots.length
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error adding deleted timeslots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/users/:userId/routines/deleted-timeslots - Remove timeslots from deleted list
router.delete('/:userId/routines/deleted-timeslots', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUserId = (req as any).user?.id;
    
    if (parseInt(userId) !== requestingUserId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    const { timeslots } = req.body;
    
    if (!timeslots || !Array.isArray(timeslots)) {
      res.status(400).json({ error: 'Timeslots array is required' });
      return;
    }
    
    // Use a transaction to ensure all deletions succeed or fail together
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Delete each timeslot from the deleted list
      for (const timeslot of timeslots) {
        const deleteQuery = `
          DELETE FROM user_deleted_timeslots 
          WHERE user_id = $1 AND time_slot = $2
        `;
        
        await client.query(deleteQuery, [userId, timeslot]);
      }
      
      await client.query('COMMIT');
      
      res.json({
        message: `Successfully restored ${timeslots.length} timeslot(s)`,
        restoredCount: timeslots.length
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error restoring timeslots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:userId/settings - Get user settings
router.get('/:userId/settings', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUserId = (req as any).user?.id;
    
    console.log('GET /api/users/:userId/settings called');
    console.log('Requested userId:', userId);
    console.log('Authenticated userId:', requestingUserId);
    
    if (parseInt(userId) !== requestingUserId) {
      console.log('Access denied - userId mismatch');
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    const query = `
      SELECT setting_key, setting_value FROM user_settings 
      WHERE user_id = $1
    `;
    
    console.log('Executing settings query with userId:', userId);
    const result = await pool.query(query, [userId]);
    console.log('Settings query result rows:', result.rows);
    
    // Convert array of rows to object
    const settings: { [key: string]: string } = {};
    result.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    
    console.log('Sending settings response:', { settings });
    res.json({ settings });
  } catch (error: any) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users/:userId/settings - Save user settings
router.post('/:userId/settings', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUserId = (req as any).user?.id;
    
    console.log('POST /api/users/:userId/settings called');
    console.log('Requested userId:', userId);
    console.log('Authenticated userId:', requestingUserId);
    console.log('Request body:', req.body);
    
    if (parseInt(userId) !== requestingUserId) {
      console.log('Access denied - userId mismatch');
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    const { settings } = req.body;
    
    console.log('Extracted settings:', settings);
    
    if (!settings || typeof settings !== 'object') {
      console.log('Invalid settings format:', settings);
      res.status(400).json({ error: 'Settings object is required' });
      return;
    }
    
    // Use a transaction to ensure all settings are saved together
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      console.log('Transaction started');
      
      // Save each setting
      for (const [key, value] of Object.entries(settings)) {
        console.log(`Saving setting: ${key} = ${value}`);
        const upsertQuery = `
          INSERT INTO user_settings (user_id, setting_key, setting_value)
          VALUES ($1, $2, $3)
          ON CONFLICT (user_id, setting_key) 
          DO UPDATE SET setting_value = $3, updated_at = CURRENT_TIMESTAMP
        `;
        
        const result = await client.query(upsertQuery, [userId, key, value]);
        console.log(`Setting ${key} saved, rows affected:`, result.rowCount);
      }
      
      await client.query('COMMIT');
      console.log('Transaction committed successfully');
      
      res.json({
        message: 'Settings saved successfully',
        savedCount: Object.keys(settings).length
      });
    } catch (error) {
      console.error('Error in transaction, rolling back:', error);
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error saving user settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
