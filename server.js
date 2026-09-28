import app from './src/app.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
=====================================================
🚀 STUDYMATE AI BACKEND SERVER STARTED
=====================================================
📡 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Server URL:  http://localhost:${PORT}
🩺 Health Check: http://localhost:${PORT}/api/health
=====================================================
  `);
});

// Handle graceful shutdowns
process.on('SIGINT', () => {
  console.log('\n🛑 Gracefully shutting down server...');
  server.close(() => {
    console.log('✅ Server closed cleanly.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received. Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed cleanly.');
    process.exit(0);
  });
});
