import pool from '../config/database';

async function main() {
  try {
    console.log('🔄 Checking user_weight table date column type...');
    
    // Check the date column type
    const columnInfo = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        udt_name
      FROM information_schema.columns 
      WHERE table_name = 'user_weight' AND column_name = 'date'
    `);
    
    console.log('Weight date column info:', columnInfo.rows[0]);
    
    // Show current weight entries
    const weightEntries = await pool.query(`
      SELECT id, weight, date, time, notes FROM user_weight ORDER BY id
    `);
    
    console.log('\nCurrent weight entries:');
    weightEntries.rows.forEach(row => {
      console.log(`  ID ${row.id}: ${row.weight} lbs - ${row.date} (${row.time}) - ${row.notes || 'no notes'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking weight date column:', error);
    process.exit(1);
  }
}

main();
