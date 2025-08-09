import { runListsMigration } from '../config/lists-migration';
import { testConnection } from '../config/database';

const runMigration = async () => {
  try {
    console.log('🚀 Starting lists migration...');
    
    // Test database connection first
    const connection = await testConnection();
    if (!connection.success) {
      throw new Error('Database connection failed');
    }
    
    // Run the migration
    await runListsMigration();
    
    console.log('✅ Lists migration completed successfully!');
    console.log('📋 Next steps:');
    console.log('1. Update lists APIs to use new schema');
    console.log('2. Update frontend lists to work with new API structure');
    console.log('3. Add user registration functionality');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
