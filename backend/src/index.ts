import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { runMigrations } from './config/migrations';
import { testConnection } from './config/database';
import authRoutes from './routes/auth';
import listRoutes from './routes/lists';
import albumRoutes from './routes/albums';
import nbaPlayerRoutes from './routes/nba-players';
import userRoutineRoutes from './routes/user-routines';
import userRoutes from './routes/users';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://narju.net',
    'https://www.narju.net',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/nba-players', nbaPlayerRoutes);
app.use('/api/users', userRoutineRoutes);
app.use('/api/users', userRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Narju Backend API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Database test endpoint
app.get('/db-test', async (req, res) => {
  try {
    const result = await testConnection();
    if (result.success) {
      res.json({ 
        status: 'Database connected',
        timestamp: result.timestamp
      });
    } else {
      res.status(500).json({ 
        status: 'Database error',
        error: result.error 
      });
    }
  } catch (error: any) {
    res.status(500).json({ 
      status: 'Database error',
      error: error.message 
    });
  }
});

// Start server
console.log('🚀 Starting server...');
const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Run database migrations
  try {
    await runMigrations();
  } catch (error) {
    console.error('❌ Failed to run migrations:', error);
  }
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
}); 