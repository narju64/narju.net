import pool from '../config/database';

async function main() {
  try {
    console.log('🔄 Debugging meal date issues...');
    
    // Get all meals with their dates and created_at timestamps
    const meals = await pool.query(`
      SELECT 
        id,
        name,
        meal_type,
        date,
        created_at,
        EXTRACT(EPOCH FROM (created_at - date)) / 86400 as days_difference
      FROM user_meals 
      ORDER BY created_at DESC
    `);
    
    console.log('\nMeal date analysis:');
    console.log('ID | Name | Meal Type | Date | Created At | Days Diff');
    console.log('---|------|-----------|------|------------|----------');
    
    meals.rows.forEach(meal => {
      const daysDiff = Math.round(meal.days_difference * 100) / 100;
      console.log(`${meal.id} | ${meal.name.substring(0, 20)} | ${meal.meal_type} | ${meal.date} | ${meal.created_at} | ${daysDiff}`);
    });
    
    // Check for any meals where date doesn't match created_at date
    const mismatchedMeals = await pool.query(`
      SELECT 
        id,
        name,
        meal_type,
        date,
        created_at,
        DATE(created_at) as created_date
      FROM user_meals 
      WHERE date != DATE(created_at)
      ORDER BY created_at DESC
    `);
    
    if (mismatchedMeals.rows.length > 0) {
      console.log('\n❌ Meals with mismatched dates:');
      mismatchedMeals.rows.forEach(meal => {
        console.log(`  ID ${meal.id}: Date=${meal.date}, Created=${meal.created_date}, Name=${meal.name}`);
      });
    } else {
      console.log('\n✅ All meal dates match their created_at dates');
    }
    
    // Check the current timezone settings
    const timezone = await pool.query('SHOW timezone');
    console.log(`\nDatabase timezone: ${timezone.rows[0].TimeZone}`);
    
    // Check what today's date should be
    const now = new Date();
    console.log(`\nCurrent local time: ${now.toLocaleString()}`);
    console.log(`Current UTC time: ${now.toISOString()}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error debugging meal dates:', error);
    process.exit(1);
  }
}

main();
