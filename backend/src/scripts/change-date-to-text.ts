import pool from '../config/database';

async function main() {
  try {
    console.log('🔄 Changing date column from date type to text type...');
    
    // First, backup the current data
    const backupQuery = `
      ALTER TABLE user_meals 
      ADD COLUMN date_text TEXT
    `;
    
    await pool.query(backupQuery);
    console.log('✅ Added backup date_text column');
    
    // Copy the current date data to the text column
    const copyQuery = `
      UPDATE user_meals 
      SET date_text = TO_CHAR(date, 'MM-DD-YYYY')
    `;
    
    await pool.query(copyQuery);
    console.log('✅ Copied existing dates to text format');
    
    // Drop the old date column
    const dropQuery = `
      ALTER TABLE user_meals 
      DROP COLUMN date
    `;
    
    await pool.query(dropQuery);
    console.log('✅ Dropped old date column');
    
    // Rename the text column to date
    const renameQuery = `
      ALTER TABLE user_meals 
      RENAME COLUMN date_text TO date
    `;
    
    await pool.query(renameQuery);
    console.log('✅ Renamed date_text to date');
    
    // Verify the change
    const verifyQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_meals' AND column_name = 'date'
    `;
    
    const result = await pool.query(verifyQuery);
    console.log('✅ Date column is now:', result.rows[0]);
    
    // Show sample data
    const sampleQuery = `
      SELECT id, name, date FROM user_meals LIMIT 3
    `;
    
    const sample = await pool.query(sampleQuery);
    console.log('✅ Sample data:', sample.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error changing date column:', error);
    process.exit(1);
  }
}

main();
