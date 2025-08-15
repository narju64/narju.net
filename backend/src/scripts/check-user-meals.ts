import pool from '../config/database';

async function main() {
  try {
    console.log('🔄 Checking user_meals table...');
    
    // Check table structure
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'user_meals'
      ORDER BY ordinal_position
    `);
    
    console.log('user_meals columns:');
    columns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Check if table has any data
    const count = await pool.query(`
      SELECT COUNT(*) as count FROM user_meals
    `);
    console.log(`\nTotal rows in user_meals: ${count.rows[0].count}`);
    
    // If there's data, show a sample
    if (count.rows[0].count > 0) {
      console.log('\n🔄 Sample data from user_meals:');
      const sample = await pool.query(`
        SELECT * FROM user_meals LIMIT 3
      `);
      
      sample.rows.forEach((row, index) => {
        console.log(`\nRow ${index + 1}:`);
        console.log(`  ID: ${row.id}`);
        console.log(`  User ID: ${row.user_id}`);
        console.log(`  Name: ${row.name}`);
        console.log(`  Meal Type: ${row.meal_type}`);
        console.log(`  Date: ${row.date}`);
        console.log(`  Ingredients JSON: ${typeof row.ingredients_json} - ${JSON.stringify(row.ingredients_json).substring(0, 100)}...`);
        console.log(`  Nutrition JSON: ${typeof row.nutrition_json} - ${JSON.stringify(row.nutrition_json).substring(0, 100)}...`);
        console.log(`  Created: ${row.created_at}`);
      });
    }
    
    // Check for today's meals specifically
    const today = new Date().toISOString().split('T')[0];
    console.log(`\n🔄 Checking for meals on ${today}:`);
    
    const todaysMeals = await pool.query(`
      SELECT COUNT(*) as count FROM user_meals WHERE date = $1
    `, [today]);
    
    console.log(`Meals for today (${today}): ${todaysMeals.rows[0].count}`);
    
    if (todaysMeals.rows[0].count > 0) {
      const todaysData = await pool.query(`
        SELECT * FROM user_meals WHERE date = $1
      `, [today]);
      
      console.log('\nToday\'s meals:');
      todaysData.rows.forEach((meal, index) => {
        console.log(`  ${index + 1}. ${meal.name} (${meal.meal_type})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking user_meals:', error);
    process.exit(1);
  }
}

main();
