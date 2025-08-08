import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/lists - Get all lists (public)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = 'SELECT * FROM lists ORDER BY category, order_index';
    const result = await pool.query(query);
    
    res.json({
      lists: result.rows
    });
  } catch (error: any) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/lists/:category - Get list by category (public)
router.get('/:category', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const query = 'SELECT * FROM lists WHERE category = $1 ORDER BY order_index';
    const result = await pool.query(query, [category]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'List not found' });
      return;
    }
    
    res.json({
      list: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error fetching list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/lists/:category/items - Add item to list (admin only)
router.post('/:category/items', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const { item } = req.body;
    
    if (!item) {
      res.status(400).json({ error: 'Item is required' });
      return;
    }
    
    // Get current list
    const getQuery = 'SELECT * FROM lists WHERE category = $1';
    const getResult = await pool.query(getQuery, [category]);
    
    if (getResult.rows.length === 0) {
      res.status(404).json({ error: 'List not found' });
      return;
    }
    
    const list = getResult.rows[0];
    const items = list.items_json || [];
    
    // Add new item with ID
    const newItem = {
      id: Date.now(), // Simple ID generation
      ...item,
      created_at: new Date().toISOString()
    };
    
    items.push(newItem);
    
    // Update list
    const updateQuery = 'UPDATE lists SET items_json = $1, updated_at = CURRENT_TIMESTAMP WHERE category = $2 RETURNING *';
    const updateResult = await pool.query(updateQuery, [JSON.stringify(items), category]);
    
    res.json({
      message: 'Item added successfully',
      list: updateResult.rows[0]
    });
  } catch (error: any) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/lists/:category/items/:id - Update item in list (admin only)
router.put('/:category/items/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, id } = req.params;
    const { item } = req.body;
    
    if (!item) {
      res.status(400).json({ error: 'Item is required' });
      return;
    }
    
    // Get current list
    const getQuery = 'SELECT * FROM lists WHERE category = $1';
    const getResult = await pool.query(getQuery, [category]);
    
    if (getResult.rows.length === 0) {
      res.status(404).json({ error: 'List not found' });
      return;
    }
    
    const list = getResult.rows[0];
    const items = list.items_json || [];
    
    // Find and update item
    const itemIndex = items.findIndex((i: any) => i.id === parseInt(id));
    if (itemIndex === -1) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    
    items[itemIndex] = {
      ...items[itemIndex],
      ...item,
      updated_at: new Date().toISOString()
    };
    
    // Update list
    const updateQuery = 'UPDATE lists SET items_json = $1, updated_at = CURRENT_TIMESTAMP WHERE category = $2 RETURNING *';
    const updateResult = await pool.query(updateQuery, [JSON.stringify(items), category]);
    
    res.json({
      message: 'Item updated successfully',
      list: updateResult.rows[0]
    });
  } catch (error: any) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/lists/:category/items/:id - Delete item from list (admin only)
router.delete('/:category/items/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, id } = req.params;
    
    // Get current list
    const getQuery = 'SELECT * FROM lists WHERE category = $1';
    const getResult = await pool.query(getQuery, [category]);
    
    if (getResult.rows.length === 0) {
      res.status(404).json({ error: 'List not found' });
      return;
    }
    
    const list = getResult.rows[0];
    const items = list.items_json || [];
    
    // Find and remove item
    const itemIndex = items.findIndex((i: any) => i.id === parseInt(id));
    if (itemIndex === -1) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    
    items.splice(itemIndex, 1);
    
    // Update list
    const updateQuery = 'UPDATE lists SET items_json = $1, updated_at = CURRENT_TIMESTAMP WHERE category = $2 RETURNING *';
    const updateResult = await pool.query(updateQuery, [JSON.stringify(items), category]);
    
    res.json({
      message: 'Item deleted successfully',
      list: updateResult.rows[0]
    });
  } catch (error: any) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/lists/:category/reorder - Reorder items in list (admin only)
router.put('/:category/reorder', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      res.status(400).json({ error: 'Items array is required' });
      return;
    }
    
    // Update list with new order
    const updateQuery = 'UPDATE lists SET items_json = $1, updated_at = CURRENT_TIMESTAMP WHERE category = $2 RETURNING *';
    const updateResult = await pool.query(updateQuery, [JSON.stringify(items), category]);
    
    if (updateResult.rows.length === 0) {
      res.status(404).json({ error: 'List not found' });
      return;
    }
    
    res.json({
      message: 'List reordered successfully',
      list: updateResult.rows[0]
    });
  } catch (error: any) {
    console.error('Error reordering list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
