import pool from '../config/database';

async function main() {
  try {
    console.log('🔄 Fixing existing meal dates with wrong format...');
    
    // First, let's see what dates we currently have
    const currentDates = await pool.query(`
      SELECT id, name, date FROM user_meals ORDER BY id
    `);
    
    console.log('Current dates in database:');
    currentDates.rows.forEach(row => {
      console.log(`  ID ${row.id}: ${row.name} - ${row.date}`);
    });
    
    // Fix all the wrong dates by converting them to the correct MM-DD-YYYY format
    // The wrong format is like '14-2025-8' which should be '08-14-2025'
    const fixQuery = `
      UPDATE user_meals 
      SET date = CASE 
        WHEN date ~ '^\\d{1,2}-\\d{4}-\\d{1,2}$' THEN 
          -- Convert from DD-YYYY-M format to MM-DD-YYYY
          LPAD(SPLIT_PART(date, '-', 3)::text, 2, '0') || '-' ||
          LPAD(SPLIT_PART(date, '-', 1)::text, 2, '0') || '-' ||
          SPLIT_PART(date, '-', 2)::text
        ELSE date
      END
      WHERE date ~ '^\\d{1,2}-\\d{4}-\\d{1,2}$'
    `;
    
    const result = await pool.query(fixQuery);
    console.log(`✅ Fixed ${result.rowCount} dates`);
    
    // Show the corrected dates
    const correctedDates = await pool.query(`
      SELECT id, name, date FROM user_meals ORDER BY id
    `);
    
    console.log('\nCorrected dates in database:');
    correctedDates.rows.forEach(row => {
      console.log(`  ID ${row.id}: ${row.name} - ${row.date}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing dates:', error);
    process.exit(1);
  }
}

main();
