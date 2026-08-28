const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const shareRoutes = require('./routes/share');

const app = express();

// Security Middleware
app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
})); // Set standard HTTP security headers

// Rate limiting for auth endpoints to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser with size limit to prevent payload-based DoS
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Routes
// Apply rate limiter specifically to registration and login
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/share', shareRoutes);

// Health Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error', // Force generic message in prod
    // Only send stack trace in development
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

module.exports = app;
