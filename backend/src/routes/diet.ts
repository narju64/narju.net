import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all diet routes
router.use(authenticateToken);

// ===== USER MEALS ROUTES =====

// POST /api/diet/meals - Save daily meal
router.post('/meals', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, meal_type, ingredients_json, nutrition_json, date } = req.body;
    const userId = (req as any).user.id;

    console.log('Received meal data:', { name, meal_type, ingredients_json, nutrition_json, date });
    console.log('User ID:', userId);

    if (!name || !meal_type || !ingredients_json || !nutrition_json || !date) {
      console.log('Missing required fields:', { name: !!name, meal_type: !!meal_type, ingredients_json: !!ingredients_json, nutrition_json: !!nutrition_json, date: !!date });
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Validate JSON data structure
    if (!Array.isArray(ingredients_json)) {
      console.log('ingredients_json is not an array:', typeof ingredients_json);
      res.status(400).json({ error: 'ingredients_json must be an array' });
      return;
    }

    if (typeof nutrition_json !== 'object' || nutrition_json === null) {
      console.log('nutrition_json is not an object:', typeof nutrition_json);
      res.status(400).json({ error: 'nutrition_json must be an object' });
      return;
    }

    // Validate nutrition values are numbers
    const requiredNutritionFields = ['calories', 'protein', 'fat', 'carbs', 'sugar', 'fiber'];
    for (const field of requiredNutritionFields) {
      if (typeof nutrition_json[field] !== 'number') {
        console.log(`nutrition_json.${field} is not a number:`, typeof nutrition_json[field], nutrition_json[field]);
        res.status(400).json({ error: `nutrition_json.${field} must be a number` });
        return;
      }
    }

    // Parse the date string and format it as MM-DD-YYYY for storage
    // Since we're now storing dates as text, we can avoid all timezone issues
    // Frontend sends MM-DD-YYYY format (e.g., '08-14-2025')
    const [month, day, year] = date.split('-').map(Number);
    const formattedDate = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}-${year}`;
    
    const query = `
      INSERT INTO user_meals (user_id, name, meal_type, ingredients_json, nutrition_json, date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    console.log('Executing query with values:', [userId, name, meal_type, ingredients_json, nutrition_json, formattedDate]);

    // Convert JavaScript objects to JSON strings for PostgreSQL
    const ingredientsJsonString = JSON.stringify(ingredients_json);
    const nutritionJsonString = JSON.stringify(nutrition_json);

    const result = await pool.query(query, [userId, name, meal_type, ingredientsJsonString, nutritionJsonString, formattedDate]);
    
    console.log('Query successful, result:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Save meal error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/diet/meals/:date - Get meals for specific date
router.get('/meals/:date', async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.params;
    const userId = (req as any).user.id;

    const query = `
      SELECT * FROM user_meals 
      WHERE user_id = $1 AND date = $2 
      ORDER BY created_at ASC
    `;

    const result = await pool.query(query, [userId, date]);
    
    res.json({ meals: result.rows });
  } catch (error: any) {
    console.error('Get meals by date error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/diet/meals/history - Get meal history with pagination
router.get('/meals/history', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 30, start_date, end_date } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT * FROM user_meals 
      WHERE user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (start_date) {
      query += ` AND date >= $${paramIndex}`;
      params.push(start_date as string);
      paramIndex++;
    }

    if (end_date) {
      query += ` AND date <= $${paramIndex}`;
      params.push(end_date as string);
      paramIndex++;
    }

    query += ` ORDER BY date DESC, created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), offset);

    const result = await pool.query(query, params);
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Get meal history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/diet/meals/:id - Delete specific meal
router.delete('/meals/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const query = `
      DELETE FROM user_meals 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [id, userId]);
    
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Meal not found or unauthorized' });
      return;
    }

    res.json({ message: 'Meal deleted successfully' });
  } catch (error: any) {
    console.error('Delete meal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== USER WEIGHT ROUTES =====

// POST /api/diet/weight - Record weight
router.post('/weight', async (req: Request, res: Response): Promise<void> => {
  try {
    const { weight, date, notes, time } = req.body;
    const userId = (req as any).user.id;

    if (!weight || !date) {
      res.status(400).json({ error: 'Weight and date are required' });
      return;
    }

    const query = `
      INSERT INTO user_weight (user_id, weight, date, notes, time)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, date, time) 
      DO UPDATE SET weight = $2, notes = $3, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [userId, weight, date, notes || null, time || 'morning']);
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Record weight error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/diet/weight - Get all weight entries for user
router.get('/weight', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const query = `
      SELECT * FROM user_weight 
      WHERE user_id = $1
      ORDER BY date DESC
    `;

    const result = await pool.query(query, [userId]);
    
    res.json({ entries: result.rows });
  } catch (error: any) {
    console.error('Get weight entries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/diet/weight/history - Get weight history with date filtering
router.get('/weight/history', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { start_date, end_date } = req.query;

    let query = `
      SELECT * FROM user_weight 
      WHERE user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (start_date) {
      query += ` AND date >= $${paramIndex}`;
      params.push(start_date as string);
      paramIndex++;
    }

    if (end_date) {
      query += ` AND date <= $${paramIndex}`;
      params.push(end_date as string);
      paramIndex++;
    }

    query += ` ORDER BY date DESC`;

    const result = await pool.query(query, params);
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Get weight history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/diet/weight/:id - Update weight entry
router.put('/weight/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { weight, notes, time } = req.body;
    const userId = (req as any).user.id;

    if (!weight) {
      res.status(400).json({ error: 'Weight is required' });
      return;
    }

    const query = `
      UPDATE user_weight 
      SET weight = $1, notes = $2, time = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND user_id = $5
      RETURNING *
    `;

    const result = await pool.query(query, [weight, notes || null, time || 'morning', id, userId]);
    
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Weight entry not found or unauthorized' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Update weight error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/diet/weight/:id - Delete weight entry
router.delete('/weight/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const query = `
      DELETE FROM user_weight 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [id, userId]);
    
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Weight entry not found or unauthorized' });
      return;
    }

    res.json({ message: 'Weight entry deleted successfully' });
  } catch (error: any) {
    console.error('Delete weight error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== USER SAVED MEALS ROUTES =====

// POST /api/diet/saved-meals - Save custom meal
router.post('/saved-meals', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, ingredients_json, nutrition_json, is_favorite } = req.body;
    const userId = (req as any).user.id;

    if (!name || !ingredients_json || !nutrition_json) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const query = `
      INSERT INTO user_saved_meals (user_id, name, ingredients_json, nutrition_json, is_favorite)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    // Convert JavaScript objects to JSON strings for PostgreSQL
    const ingredientsJsonString = JSON.stringify(ingredients_json);
    const nutritionJsonString = JSON.stringify(nutrition_json);

    const result = await pool.query(query, [userId, name, ingredientsJsonString, nutritionJsonString, is_favorite || false]);
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Save custom meal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/diet/saved-meals - Get user's saved meals
router.get('/saved-meals', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const query = `
      SELECT * FROM user_saved_meals 
      WHERE user_id = $1 
      ORDER BY is_favorite DESC, name ASC
    `;

    const result = await pool.query(query, [userId]);
    
    res.json({ meals: result.rows });
  } catch (error: any) {
    console.error('Get saved meals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/diet/saved-meals/:id - Update saved meal
router.put('/saved-meals/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, ingredients_json, nutrition_json, is_favorite } = req.body;
    const userId = (req as any).user.id;

    if (!name || !ingredients_json || !nutrition_json) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const query = `
      UPDATE user_saved_meals 
      SET name = $1, ingredients_json = $2, nutrition_json = $3, is_favorite = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND user_id = $6
      RETURNING *
    `;

    // Convert JavaScript objects to JSON strings for PostgreSQL
    const ingredientsJsonString = JSON.stringify(ingredients_json);
    const nutritionJsonString = JSON.stringify(nutrition_json);

    const result = await pool.query(query, [name, ingredientsJsonString, nutritionJsonString, is_favorite || false, id, userId]);
    
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Saved meal not found or unauthorized' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Update saved meal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/diet/saved-meals/:id - Delete saved meal
router.delete('/saved-meals/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const query = `
      DELETE FROM user_saved_meals 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [id, userId]);
    
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Saved meal not found or unauthorized' });
      return;
    }

    res.json({ message: 'Saved meal deleted successfully' });
  } catch (error: any) {
    console.error('Delete saved meal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== USER CUSTOM INGREDIENTS ROUTES =====

// POST /api/diet/ingredients - Add custom ingredient
router.post('/ingredients', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, calories, protein, fat, carbs, sugar, fiber, category, serving_size, serving_size_value, serving_size_unit } = req.body;
    const userId = (req as any).user.id;

    if (!name || calories === undefined || protein === undefined || fat === undefined || carbs === undefined || sugar === undefined || fiber === undefined || !category || !serving_size) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const query = `
      INSERT INTO user_ingredients (user_id, name, calories, protein, fat, carbs, sugar, fiber, category, serving_size, serving_size_value, serving_size_unit)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const result = await pool.query(query, [
      userId, name, calories, protein, fat, carbs, sugar, fiber, category, 
      serving_size, serving_size_value || null, serving_size_unit || null
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Add custom ingredient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/diet/ingredients - Get user's visible custom ingredients
router.get('/ingredients', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const query = `
      SELECT * FROM user_ingredients 
      WHERE user_id = $1 AND is_hidden = false
      ORDER BY category ASC, name ASC
    `;
    
    const result = await pool.query(query, [userId]);
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Get custom ingredients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/diet/ingredients/all - Get all user's custom ingredients (including hidden ones)
router.get('/ingredients/all', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const query = `
      SELECT * FROM user_ingredients 
      WHERE user_id = $1 
      ORDER BY category ASC, name ASC
    `;
    
    const result = await pool.query(query, [userId]);
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Get all custom ingredients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/diet/ingredients/:id - Update custom ingredient
router.put('/ingredients/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, calories, protein, fat, carbs, sugar, fiber, category, serving_size, serving_size_value, serving_size_unit } = req.body;
    const userId = (req as any).user.id;

    if (!name || calories === undefined || protein === undefined || fat === undefined || carbs === undefined || sugar === undefined || fiber === undefined || !category || !serving_size) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const query = `
      UPDATE user_ingredients 
      SET name = $1, calories = $2, protein = $3, fat = $4, carbs = $5, sugar = $6, fiber = $7, 
          category = $8, serving_size = $9, serving_size_value = $10, serving_size_unit = $11, updated_at = CURRENT_TIMESTAMP
      WHERE id = $12 AND user_id = $13
      RETURNING *
    `;

    const result = await pool.query(query, [
      name, calories, protein, fat, carbs, sugar, fiber, category, 
      serving_size, serving_size_value || null, serving_size_unit || null, id, userId
    ]);
    
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Custom ingredient not found or unauthorized' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Update custom ingredient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/diet/ingredients/:id - Delete custom ingredient
router.delete('/ingredients/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const query = `
      DELETE FROM user_ingredients 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, userId]);
    
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Custom ingredient not found or unauthorized' });
      return;
    }

    res.json({ message: 'Custom ingredient deleted successfully' });
  } catch (error: any) {
    console.error('Delete custom ingredient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/diet/ingredients/:id/toggle-hidden - Toggle custom ingredient visibility
router.post('/ingredients/:id/toggle-hidden', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const query = `
      UPDATE user_ingredients 
      SET is_hidden = NOT is_hidden, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, userId]);
    
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Custom ingredient not found or unauthorized' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Toggle custom ingredient visibility error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== PRESET INGREDIENTS ROUTES =====

// GET /api/diet/preset-ingredients - Get all preset ingredients (with user preferences)
router.get('/preset-ingredients', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    // Get all active preset ingredients
    const ingredientsQuery = `
      SELECT * FROM preset_ingredients 
      WHERE is_active = true 
      ORDER BY category ASC, name ASC
    `;
    
    const ingredientsResult = await pool.query(ingredientsQuery);
    
    // Get user preferences for these ingredients
    const preferencesQuery = `
      SELECT ingredient_id, is_hidden, is_favorite, 
             custom_calories, custom_protein, custom_fat, custom_carbs, custom_sugar, custom_fiber
      FROM user_ingredient_preferences 
      WHERE user_id = $1
    `;
    
    const preferencesResult = await pool.query(preferencesQuery, [userId]);
    
    // Create a map of preferences by ingredient_id
    const preferencesMap = new Map();
    preferencesResult.rows.forEach(pref => {
      preferencesMap.set(pref.ingredient_id, pref);
    });
    
    // Combine ingredients with user preferences
    const ingredientsWithPreferences = ingredientsResult.rows.map(ingredient => {
      const preferences = preferencesMap.get(ingredient.id);
      
      if (preferences && preferences.is_hidden) {
        return null; // Skip hidden ingredients
      }
      
      // Apply custom values if they exist, otherwise use preset values
      return {
        id: ingredient.id.toString(),
        name: ingredient.name,
        calories: preferences?.custom_calories || ingredient.calories,
        protein: preferences?.custom_protein || ingredient.protein,
        fat: preferences?.custom_fat || ingredient.fat,
        carbs: preferences?.custom_carbs || ingredient.carbs,
        sugar: preferences?.custom_sugar || ingredient.sugar,
        fiber: preferences?.custom_fiber || ingredient.fiber,
        category: ingredient.category,
        servingSize: ingredient.serving_size,
        servingSizeValue: ingredient.serving_size_value,
        servingSizeUnit: ingredient.serving_size_unit,
        isFavorite: preferences?.is_favorite || false
      };
    }).filter(Boolean); // Remove null values (hidden ingredients)
    
    res.json({ ingredients: ingredientsWithPreferences });
  } catch (error: any) {
    console.error('Get preset ingredients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/diet/ingredient-preferences - Get user ingredient preferences
router.get('/ingredient-preferences', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const query = `
      SELECT up.*, pi.name as ingredient_name, pi.category
      FROM user_ingredient_preferences up
      JOIN preset_ingredients pi ON up.ingredient_id = pi.id
      WHERE up.user_id = $1
      ORDER BY pi.category ASC, pi.name ASC
    `;
    
    const result = await pool.query(query, [userId]);
    res.json({ preferences: result.rows });
  } catch (error: any) {
    console.error('Get ingredient preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/diet/all-preset-ingredients - Get all preset ingredients (including hidden ones)
router.get('/all-preset-ingredients', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    // Get all active preset ingredients (including hidden ones)
    const ingredientsQuery = `
      SELECT * FROM preset_ingredients 
      WHERE is_active = true 
      ORDER BY category ASC, name ASC
    `;
    
    const ingredientsResult = await pool.query(ingredientsQuery);
    
    // Get user preferences for these ingredients
    const preferencesQuery = `
      SELECT ingredient_id, is_hidden, is_favorite, 
             custom_calories, custom_protein, custom_fat, custom_carbs, custom_sugar, custom_fiber
      FROM user_ingredient_preferences 
      WHERE user_id = $1
    `;
    
    const preferencesResult = await pool.query(preferencesQuery, [userId]);
    
    // Create a map of preferences by ingredient_id
    const preferencesMap = new Map();
    preferencesResult.rows.forEach(pref => {
      preferencesMap.set(pref.ingredient_id, pref);
    });
    
    // Return all ingredients with their hidden status
    const allIngredients = ingredientsResult.rows.map(ingredient => {
      const preferences = preferencesMap.get(ingredient.id);
      
      return {
        id: ingredient.id.toString(),
        name: ingredient.name,
        calories: preferences?.custom_calories || ingredient.calories,
        protein: preferences?.custom_protein || ingredient.protein,
        fat: preferences?.custom_fat || ingredient.fat,
        carbs: preferences?.custom_carbs || ingredient.carbs,
        sugar: preferences?.custom_sugar || ingredient.sugar,
        fiber: preferences?.custom_fiber || ingredient.fiber,
        category: ingredient.category,
        servingSize: ingredient.serving_size,
        servingSizeValue: ingredient.serving_size_value,
        servingSizeUnit: ingredient.serving_size_unit,
        isFavorite: preferences?.is_favorite || false,
        isHidden: preferences?.is_hidden || false
      };
    });
    
    res.json({ ingredients: allIngredients });
  } catch (error: any) {
    console.error('Get all preset ingredients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/diet/ingredient-preferences/:id/toggle-hidden - Toggle ingredient visibility
router.post('/ingredient-preferences/:id/toggle-hidden', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // First check if a preference record exists
    const checkQuery = `
      SELECT * FROM user_ingredient_preferences 
      WHERE user_id = $1 AND ingredient_id = $2
    `;
    
    const checkResult = await pool.query(checkQuery, [userId, id]);
    
    if (checkResult.rows.length > 0) {
      // Update existing preference
      const updateQuery = `
        UPDATE user_ingredient_preferences 
        SET is_hidden = NOT is_hidden, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND ingredient_id = $2
        RETURNING *
      `;
      
      const result = await pool.query(updateQuery, [userId, id]);
      res.json(result.rows[0]);
    } else {
      // Create new preference record with hidden = true
      const insertQuery = `
        INSERT INTO user_ingredient_preferences (user_id, ingredient_id, is_hidden)
        VALUES ($1, $2, true)
        RETURNING *
      `;
      
      const result = await pool.query(insertQuery, [userId, id]);
      res.json(result.rows[0]);
    }
  } catch (error: any) {
    console.error('Toggle ingredient visibility error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
