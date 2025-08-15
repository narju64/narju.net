import pool from './database';

// Create User Meals table
export const createUserMealsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS user_meals (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
      ingredients_json JSONB NOT NULL,
      nutrition_json JSONB NOT NULL,
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await pool.query(query);
    console.log('✅ User Meals table created successfully');
  } catch (error) {
    console.error('❌ Error creating user_meals table:', error);
    throw error;
  }
};

// Create User Weight table
export const createUserWeightTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS user_weight (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      weight DECIMAL(5,2) NOT NULL,
      date DATE NOT NULL,
      notes TEXT,
      time VARCHAR(20) DEFAULT 'morning',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      -- Ensure one weight entry per user per day
      UNIQUE(user_id, date)
    );
  `;
  
  try {
    await pool.query(query);
    console.log('✅ User Weight table created successfully');
  } catch (error) {
    console.error('❌ Error creating user_weight table:', error);
    throw error;
  }
};

// Create User Saved Meals table
export const createUserSavedMealsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS user_saved_meals (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      ingredients_json JSONB NOT NULL,
      nutrition_json JSONB NOT NULL,
      is_favorite BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await pool.query(query);
    console.log('✅ User Saved Meals table created successfully');
  } catch (error) {
    console.error('❌ Error creating user_saved_meals table:', error);
    throw error;
  }
};

// Create Preset Ingredients table (admin-managed)
export const createPresetIngredientsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS preset_ingredients (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      calories DECIMAL(8,2) NOT NULL,
      protein DECIMAL(8,2) NOT NULL,
      fat DECIMAL(8,2) NOT NULL,
      carbs DECIMAL(8,2) NOT NULL,
      sugar DECIMAL(8,2) NOT NULL,
      fiber DECIMAL(8,2) NOT NULL,
      category VARCHAR(50) NOT NULL,
      serving_size VARCHAR(100) NOT NULL,
      serving_size_value DECIMAL(8,2),
      serving_size_unit VARCHAR(20),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await pool.query(query);
    console.log('✅ Preset Ingredients table created successfully');
  } catch (error) {
    console.error('❌ Error creating preset_ingredients table:', error);
    throw error;
  }
};

// Create User Ingredient Preferences table (personalization)
export const createUserIngredientPreferencesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS user_ingredient_preferences (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      ingredient_id INTEGER NOT NULL REFERENCES preset_ingredients(id) ON DELETE CASCADE,
      is_hidden BOOLEAN DEFAULT false,
      is_favorite BOOLEAN DEFAULT false,
      custom_calories DECIMAL(8,2),
      custom_protein DECIMAL(8,2),
      custom_fat DECIMAL(8,2),
      custom_carbs DECIMAL(8,2),
      custom_sugar DECIMAL(8,2),
      custom_fiber DECIMAL(8,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      UNIQUE(user_id, ingredient_id)
    );
  `;
  
  try {
    await pool.query(query);
    console.log('✅ User Ingredient Preferences table created successfully');
  } catch (error) {
    console.error('❌ Error creating user_ingredient_preferences table:', error);
    throw error;
  }
};

// Create User Custom Ingredients table
export const createUserIngredientsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS user_ingredients (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      calories DECIMAL(8,2) NOT NULL,
      protein DECIMAL(8,2) NOT NULL,
      fat DECIMAL(8,2) NOT NULL,
      carbs DECIMAL(8,2) NOT NULL,
      sugar DECIMAL(8,2) NOT NULL,
      fiber DECIMAL(8,2) NOT NULL,
      category VARCHAR(50) NOT NULL,
      serving_size VARCHAR(100) NOT NULL,
      serving_size_value DECIMAL(8,2),
      serving_size_unit VARCHAR(20),
      is_hidden BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await pool.query(query);
    console.log('✅ User Custom Ingredients table created successfully');
  } catch (error) {
    console.error('❌ Error creating user_ingredients table:', error);
    throw error;
  }
};

// Add is_hidden column to existing user_ingredients tables
export const addHiddenColumnToUserIngredients = async () => {
  try {
    // Check if column already exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_ingredients' AND column_name = 'is_hidden'
    `;
    
    const checkResult = await pool.query(checkQuery);
    
    if (checkResult.rows.length === 0) {
      const alterQuery = `
        ALTER TABLE user_ingredients 
        ADD COLUMN is_hidden BOOLEAN DEFAULT false
      `;
      
      await pool.query(alterQuery);
      console.log('✅ Added is_hidden column to user_ingredients table');
    } else {
      console.log('ℹ️ is_hidden column already exists in user_ingredients table');
    }
  } catch (error) {
    console.error('❌ Error adding is_hidden column to user_ingredients table:', error);
    throw error;
  }
};

// Migrate existing user_weight table to add missing columns
export const migrateUserWeightTable = async () => {
  try {
    // Check if time column exists
    const checkTimeColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_weight' AND column_name = 'time'
    `);
    
    if (checkTimeColumn.rows.length === 0) {
      // Add time column
      await pool.query(`
        ALTER TABLE user_weight 
        ADD COLUMN time VARCHAR(20) DEFAULT 'morning'
      `);
      console.log('✅ Added time column to user_weight table');
    }
    
    // Check if updated_at column exists
    const checkUpdatedAtColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_weight' AND column_name = 'updated_at'
    `);
    
    if (checkUpdatedAtColumn.rows.length === 0) {
      // Add updated_at column
      await pool.query(`
        ALTER TABLE user_weight 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ Added updated_at column to user_weight table');
    }
    
    // Check if unique constraint exists
    const checkUniqueConstraint = await pool.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'user_weight' 
      AND constraint_type = 'UNIQUE' 
      AND constraint_name LIKE '%user_id_date%'
    `);
    
    if (checkUniqueConstraint.rows.length === 0) {
      // Add unique constraint
      await pool.query(`
        ALTER TABLE user_weight 
        ADD CONSTRAINT user_weight_user_id_date_unique UNIQUE(user_id, date)
      `);
      console.log('✅ Added unique constraint on (user_id, date) to user_weight table');
    }
    
    console.log('✅ User Weight table migration completed');
  } catch (error) {
    console.error('❌ Error migrating user_weight table:', error);
    throw error;
  }
};

// Run all diet migrations
export const runDietMigrations = async () => {
  try {
    console.log('🔄 Running diet system migrations...');
    await createUserMealsTable();
    await createUserWeightTable();
    await createUserSavedMealsTable();
    await createPresetIngredientsTable();
    await createUserIngredientPreferencesTable();
    await createUserIngredientsTable();
    await addHiddenColumnToUserIngredients();
    await migrateUserWeightTable(); // Add this line to run the new migration
    console.log('✅ All diet migrations completed successfully');
  } catch (error) {
    console.error('❌ Diet migrations failed:', error);
    throw error;
  }
};
