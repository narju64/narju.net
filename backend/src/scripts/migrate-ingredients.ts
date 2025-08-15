import pool from '../config/database';
import { dietData } from '../data/diet-data';

const migrateIngredients = async () => {
  try {
    console.log('🔄 Starting ingredient migration...');
    
    // First, let's see what we have
    console.log(`📊 Found ${dietData.length} ingredients to migrate`);
    
    // Clear existing data first to avoid conflicts
    console.log('🧹 Clearing existing preset ingredients...');
    await pool.query('DELETE FROM preset_ingredients');
    console.log('✅ Cleared existing data');
    
    // Insert each ingredient
    for (const ingredient of dietData) {
      const query = `
        INSERT INTO preset_ingredients (
          name, calories, protein, fat, carbs, sugar, fiber, 
          category, serving_size, serving_size_value, serving_size_unit
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, name
      `;
      
      const values = [
        ingredient.name,
        ingredient.calories,
        ingredient.protein,
        ingredient.fat,
        ingredient.carbs,
        ingredient.sugar,
        ingredient.fiber,
        ingredient.category,
        ingredient.servingSize,
        ingredient.servingSizeValue || null,
        ingredient.servingSizeUnit || null
      ];
      
      const result = await pool.query(query, values);
      console.log(`✅ Migrated: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
    }
    
    // Verify migration
    const countResult = await pool.query('SELECT COUNT(*) FROM preset_ingredients');
    console.log(`📊 Total ingredients in database: ${countResult.rows[0].count}`);
    
    console.log('✅ Ingredient migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

// Run migration if called directly
if (require.main === module) {
  migrateIngredients()
    .then(() => {
      console.log('🎉 Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

export default migrateIngredients;
