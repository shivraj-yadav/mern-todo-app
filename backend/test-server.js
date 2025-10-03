// Simple test server to check if basic setup works
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// CORS
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Test server is working!',
    port: process.env.PORT || 5000,
    timestamp: new Date().toISOString()
  });
});

// Test auth route
app.post('/api/auth/register', (req, res) => {
  console.log('📝 Test registration received:', req.body);
  res.json({ 
    message: 'Test registration endpoint working',
    received: req.body
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📍 Environment PORT: ${process.env.PORT}`);
  console.log(`🔗 Test URL: http://localhost:${PORT}/api/test`);
});
