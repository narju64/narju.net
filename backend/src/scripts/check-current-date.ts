import pool from '../config/database';

async function main() {
  try {
    console.log('🔄 Checking current date and time...');
    
    // Check current timestamp in database
    const result = await pool.query('SELECT NOW() as current_time, CURRENT_DATE as current_date');
    
    console.log('Database current time:', result.rows[0].current_time);
    console.log('Database current date:', result.rows[0].current_date);
    
    // Check what meals exist and their dates
    const meals = await pool.query(`
      SELECT id, name, meal_type, date, created_at 
      FROM user_meals 
      ORDER BY date DESC, created_at DESC
    `);
    
    console.log('\nAll meals in database:');
    meals.rows.forEach(meal => {
      console.log(`  ID ${meal.id}: ${meal.name} (${meal.meal_type}) - Date: ${meal.date} - Created: ${meal.created_at}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking current date:', error);
    process.exit(1);
  }
}

main();
