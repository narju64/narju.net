import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Debug: Log the DATABASE_URL (without password for security)
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  const maskedUrl = dbUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  console.log('🔗 Database URL:', maskedUrl);
} else {
  console.error('❌ DATABASE_URL not found in environment variables');
}

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Railway-specific settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Test connection function
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return { success: true, timestamp: result.rows[0].now };
  } catch (error: any) {
    console.error('Database test failed:', error);
    return { success: false, error: error.message };
  }
};

export default pool; 