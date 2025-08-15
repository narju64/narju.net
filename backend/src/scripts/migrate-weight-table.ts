import { migrateUserWeightTable } from '../config/diet-migrations';

async function main() {
  try {
    console.log('🔄 Migrating user_weight table...');
    await migrateUserWeightTable();
    console.log('✅ Weight table migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
