import pool from '../config/database';

async function main() {
  try {
    console.log('🔄 Checking date column type in user_meals table...');
    
    // Check the exact data type of the date column
    const columnInfo = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        udt_name
      FROM information_schema.columns 
      WHERE table_name = 'user_meals' AND column_name = 'date'
    `);
    
    console.log('Date column info:', columnInfo.rows[0]);
    
    // Check the table definition
    const tableDef = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'user_meals'
      ORDER BY ordinal_position
    `);
    
    console.log('\nFull table definition:');
    tableDef.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Check PostgreSQL timezone settings
    const timezone = await pool.query('SHOW timezone');
    console.log(`\nDatabase timezone: ${timezone.rows[0].TimeZone}`);
    
    // Check if there are any timezone-related settings
    const timezoneSettings = await pool.query(`
      SELECT name, setting, context 
      FROM pg_settings 
      WHERE name LIKE '%time%' OR name LIKE '%zone%'
      ORDER BY name
    `);
    
    console.log('\nTimezone-related settings:');
    timezoneSettings.rows.forEach(row => {
      console.log(`  ${row.name}: ${row.setting} (${row.context})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking date column:', error);
    process.exit(1);
  }
}

main();
