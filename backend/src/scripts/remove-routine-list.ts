import pool from '../config/database';

const removeRoutineList = async () => {
  try {
    console.log('🔄 Removing hardcoded routine from lists table...');
    
    // Remove the routine list entry
    const deleteQuery = "DELETE FROM lists WHERE category = 'routine'";
    const result = await pool.query(deleteQuery);
    
    if (result.rowCount && result.rowCount > 0) {
      console.log(`✅ Successfully removed ${result.rowCount} routine list(s) from lists table`);
    } else {
      console.log('ℹ️ No routine list found in lists table');
    }
    
    console.log('🎉 Routine cleanup completed successfully!');
    console.log('📋 The system now relies entirely on user custom routines');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error removing routine list:', error);
    process.exit(1);
  }
};

removeRoutineList();
