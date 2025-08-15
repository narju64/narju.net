import pool from '../config/database';

async function main() {
  try {
    console.log('🔄 Fixing weight table unique constraint...');
    
    // Check current constraints
    const checkConstraints = await pool.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'user_weight'
      AND constraint_type = 'UNIQUE'
    `);
    
    console.log('Current unique constraints:', checkConstraints.rows);
    
    // Add the correct unique constraint on (user_id, date, time)
    // This allows multiple entries per day but prevents duplicate time slots
    const addConstraintQuery = `
      ALTER TABLE user_weight
      ADD CONSTRAINT user_weight_user_id_date_time_unique UNIQUE(user_id, date, time)
    `;
    
    await pool.query(addConstraintQuery);
    console.log('✅ Added unique constraint on (user_id, date, time)');
    
    // Verify the constraint was added
    const verifyConstraints = await pool.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'user_weight'
      AND constraint_type = 'UNIQUE'
    `);
    
    console.log('Updated unique constraints:', verifyConstraints.rows);
    
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
    console.error('❌ Error fixing weight constraint:', error);
    process.exit(1);
  }
}

main();
