import pool from './database';
import { seedData } from './seed-data';

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

// Run all migrations
export const runMigrations = async () => {
  try {
    console.log('🔄 Running database migrations...');
    await createUsersTable();
    await createListsTable();
    await createAdminUser();
    await seedData(); // Add seed data
    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}; 