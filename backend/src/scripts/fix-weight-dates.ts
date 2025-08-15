import pool from '../config/database';

async function main() {
  try {
    console.log('🔄 Fixing wrong weight dates in database...');
    
    // Check current weight entries
    const currentEntries = await pool.query(`
      SELECT id, weight, date, time FROM user_weight ORDER BY id
    `);
    
    console.log('Current weight entries:');
    currentEntries.rows.forEach(row => {
      console.log(`  ID ${row.id}: ${row.weight} lbs - ${row.date} (${row.time})`);
    });
    
    // Temporarily remove the unique constraint
    console.log('🔄 Temporarily removing unique constraint...');
    await pool.query(`
      ALTER TABLE user_weight 
      DROP CONSTRAINT user_weight_user_id_date_unique
    `);
    console.log('✅ Removed unique constraint');
    
    // Fix the morning entry that has tomorrow's date (should be today)
    const fixQuery = `
      UPDATE user_weight 
      SET date = '08-14-2025'
      WHERE id = 6 AND time = 'morning'
    `;
    
    await pool.query(fixQuery);
    console.log('✅ Fixed morning weight entry date to 08-14-2025');
    
    // Re-add the unique constraint
    console.log('🔄 Re-adding unique constraint...');
    await pool.query(`
      ALTER TABLE user_weight 
      ADD CONSTRAINT user_weight_user_id_date_unique UNIQUE(user_id, date)
    `);
    console.log('✅ Re-added unique constraint');
    
    // Verify the fix
    const fixedEntries = await pool.query(`
      SELECT id, weight, date, time FROM user_weight ORDER BY id
    `);
    
    console.log('\nFixed weight entries:');
    fixedEntries.rows.forEach(row => {
      console.log(`  ID ${row.id}: ${row.weight} lbs - ${row.date} (${row.time})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing weight dates:', error);
    process.exit(1);
  }
}

main();
