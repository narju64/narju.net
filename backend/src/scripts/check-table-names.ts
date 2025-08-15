import pool from '../config/database';

async function main() {
  try {
    console.log('🔄 Checking database table names...');
    
    // Get all table names
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('Available tables:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Check if user_meals table exists
    const userMealsExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_meals'
      );
    `);
    
    // Check if usermeals table exists
    const usermealsExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usermeals'
      );
    `);
    
    console.log('\nTable existence check:');
    console.log(`  user_meals: ${userMealsExists.rows[0].exists}`);
    console.log(`  usermeals: ${usermealsExists.rows[0].exists}`);
    
    // If usermeals exists, check its structure
    if (usermealsExists.rows[0].exists) {
      console.log('\n🔄 Checking usermeals table structure...');
      const usermealsColumns = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'usermeals'
        ORDER BY ordinal_position
      `);
      
      console.log('usermeals columns:');
      usermealsColumns.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
      
      // Check if it has any data
      const usermealsCount = await pool.query(`
        SELECT COUNT(*) as count FROM usermeals
      `);
      console.log(`\nusermeals row count: ${usermealsCount.rows[0].count}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking table names:', error);
    process.exit(1);
  }
}

main();
