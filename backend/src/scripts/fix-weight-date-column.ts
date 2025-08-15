import pool from '../config/database';

async function main() {
  try {
    console.log('🔄 Fixing weight table date column from date type to text type...');
    
    // First, backup the current data
    const backupQuery = `
      ALTER TABLE user_weight 
      ADD COLUMN date_text TEXT
    `;
    
    await pool.query(backupQuery);
    console.log('✅ Added backup date_text column');
    
    // Copy the current date data to the text column
    const copyQuery = `
      UPDATE user_weight 
      SET date_text = TO_CHAR(date, 'MM-DD-YYYY')
    `;
    
    await pool.query(copyQuery);
    console.log('✅ Copied existing dates to text format');
    
    // Drop the old date column
    const dropQuery = `
      ALTER TABLE user_weight 
      DROP COLUMN date
    `;
    
    await pool.query(dropQuery);
    console.log('✅ Dropped old date column');
    
    // Rename the text column to date
    const renameQuery = `
      ALTER TABLE user_weight 
      RENAME COLUMN date_text TO date
    `;
    
    await pool.query(renameQuery);
    console.log('✅ Renamed date_text to date');
    
    // Verify the change
    const verifyQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_weight' AND column_name = 'date'
    `;
    
    const result = await pool.query(verifyQuery);
    console.log('✅ Weight date column is now:', result.rows[0]);
    
    // Show sample data
    const sampleQuery = `
      SELECT id, weight, date, time FROM user_weight LIMIT 3
    `;
    
    const sample = await pool.query(sampleQuery);
    console.log('✅ Sample weight data:', sample.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing weight date column:', error);
    process.exit(1);
  }
}

main();
