import pool from './database';

// Create Users table
export const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP
    );
  `;
  
  try {
    await pool.query(query);
    console.log('✅ Users table created successfully');
  } catch (error) {
    console.error('❌ Error creating users table:', error);
    throw error;
  }
};

// Create Lists table
export const createListsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS lists (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      items_json JSONB NOT NULL DEFAULT '[]',
      order_index INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await pool.query(query);
    console.log('✅ Lists table created successfully');
  } catch (error) {
    console.error('❌ Error creating lists table:', error);
    throw error;
  }
};

// Create admin user
export const createAdminUser = async () => {
  const bcrypt = require('bcryptjs');
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@narju.net';
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  // Hash the password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
  
  const query = `
    INSERT INTO users (email, username, password_hash, role)
    VALUES ($1, $2, $3, 'admin')
    ON CONFLICT (email) DO NOTHING
    RETURNING id;
  `;
  
  try {
    const result = await pool.query(query, [adminEmail, adminUsername, passwordHash]);
    if (result.rows.length > 0) {
      console.log('✅ Admin user created successfully');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
};

// Create User Routines table
export const createUserRoutinesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS user_routines (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 7),
      time_slot VARCHAR(10) NOT NULL,
      activity VARCHAR(255) NOT NULL,
      category VARCHAR(50) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      -- Ensure unique time slots per user per day
      UNIQUE(user_id, day_number, time_slot)
    );
  `;
  
  try {
    await pool.query(query);
    console.log('✅ User Routines table created successfully');
  } catch (error) {
    console.error('❌ Error creating user_routines table:', error);
    throw error;
  }
};

// Create User Deleted Timeslots table
export const createUserDeletedTimeslotsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS user_deleted_timeslots (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      time_slot VARCHAR(10) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      -- Ensure unique time slots per user
      UNIQUE(user_id, time_slot)
    );
  `;
  
  try {
    await pool.query(query);
    console.log('✅ User Deleted Timeslots table created successfully');
  } catch (error) {
    console.error('❌ Error creating user_deleted_timeslots table:', error);
    throw error;
  }
};

// Create User Settings table
export const createUserSettingsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS user_settings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      setting_key VARCHAR(100) NOT NULL,
      setting_value TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      -- Ensure unique settings per user
      UNIQUE(user_id, setting_key)
    );
  `;
  
  try {
    await pool.query(query);
    console.log('✅ User Settings table created successfully');
  } catch (error) {
    console.error('❌ Error creating user_settings table:', error);
    throw error;
  }
};

// Clean up hardcoded routine from lists table
export const cleanupHardcodedRoutine = async () => {
  try {
    const result = await pool.query("DELETE FROM lists WHERE category = 'routine'");
    if (result.rowCount && result.rowCount > 0) {
      console.log(`✅ Removed ${result.rowCount} hardcoded routine entries from lists table`);
    } else {
      console.log('ℹ️ No hardcoded routine found in lists table');
    }
  } catch (error) {
    console.error('❌ Error cleaning up hardcoded routine:', error);
    throw error;
  }
};

// Run all migrations
export const runMigrations = async () => {
  try {
    console.log('🔄 Running database migrations...');
    await createUsersTable();
    await createListsTable();
    await createUserRoutinesTable();
    await createUserDeletedTimeslotsTable();
    await createUserSettingsTable();
    await createAdminUser();
    await cleanupHardcodedRoutine();
    // Note: Data has been manually uploaded to Railway database
    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}; 