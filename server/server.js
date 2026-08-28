require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

let server;

// Connect to Database
connectDB().then(() => {
  // Start the server only after successful database connection
  server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    
    // Start background jobs
    const { startTrashCleanupJob } = require('./services/trashCleanupService');
    startTrashCleanupJob();
  });
});

// Graceful Shutdown handler
const shutdown = () => {
  console.log('\nShutting down server gracefully...');
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
      const mongoose = require('mongoose');
      mongoose.connection.close().then(() => {
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
