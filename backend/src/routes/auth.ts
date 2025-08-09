import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

const router = Router();

// Login endpoint
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: 'Email or username and password are required' });
      return;
    }

    // Find user by email OR username
    const userQuery = 'SELECT * FROM users WHERE email = $1 OR username = $1';
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = userResult.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ error: 'JWT secret not configured' });
      return;
    }

    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(payload, secret, { expiresIn: '24h' });

    // Update last login
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Registration endpoint
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password } = req.body;

    // Validate input
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    // Validate email format if provided
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
      }
    }

    // Validate password strength
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    // Check if user already exists
    let existingUserQuery: string;
    let queryParams: any[];
    
    if (email && email.trim() !== '') {
      existingUserQuery = 'SELECT id FROM users WHERE email = $1 OR username = $2';
      queryParams = [email.trim(), username];
    } else {
      existingUserQuery = 'SELECT id FROM users WHERE username = $1';
      queryParams = [username];
    }
    
    const existingUserResult = await pool.query(existingUserQuery, queryParams);

    if (existingUserResult.rows.length > 0) {
      res.status(409).json({ error: 'User with this username already exists' });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const createUserQuery = `
      INSERT INTO users (email, username, password_hash, role)
      VALUES ($1, $2, $3, 'user')
      RETURNING id, email, username, role, created_at
    `;
    
    const emailValue = (email && email.trim() !== '') ? email.trim() : null;
    const newUserResult = await pool.query(createUserQuery, [emailValue, username, passwordHash]);
    const newUser = newUserResult.rows[0];

    // Generate JWT token for immediate login
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ error: 'JWT secret not configured' });
      return;
    }

    const payload = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role
    };

    const token = jwt.sign(payload, secret, { expiresIn: '24h' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user info
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    // This will be called after authenticateToken middleware
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    res.json({
      user: user
    });

  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
