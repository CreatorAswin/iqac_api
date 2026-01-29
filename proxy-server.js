import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json({ limit: '50mb' }));

// Proxy endpoint
app.post('/api', async (req, res) => {
  try {
    const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbzrdKmvcKtytjFW7V_oXV3Ricm1hfuaumjoam0pjLAUy0XCdM8nTqqmnnOv7_NUNZzS/exec';
    
    console.log('Proxying request to:', googleScriptUrl);
    console.log('Request body:', req.body);
    
    const response = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    console.log('Response from Google Apps Script:', data);
    
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      success: false,
      error: 'Proxy server error: ' + error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Proxy server is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Forwarding requests to Google Apps Script`);
});