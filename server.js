const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins (required for Janitor AI)
app.use(cors());

// Increase payload size limit for Render
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request counter
let totalRequests = 0;

// Default configuration
const DEFAULT_CONFIG = {
  model: 'meta/llama-3.1-8b-instruct',
  baseURL: process.env.NIM_BASE_URL || 'https://integrate.api.nvidia.com/v1',
  defaultApiKey: process.env.NIM_API_KEY || ''
};

// Clean and format messages for NVIDIA NIM
function cleanMessagesForNIM(messages) {
  return messages.map(msg => {
    let content = msg.content;
    
    // Strip HTML tags if present
    content = content.replace(/<[^>]*>/g, '');
    
    // Remove excessive newlines
    content = content.replace(/\n{3,}/g, '\n\n');
    
    // Trim whitespace
    content = content.trim();
    
    return {
      role: msg.role,
      content: content
    };
  }).filter(msg => msg.content.length > 0);
}

// Serve the landing page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>NVIDIA NIM Proxy</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 800px;
          width: 100%;
          padding: 40px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        h1 {
          color: #333;
          font-size: 2.5em;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .subtitle {
          color: #666;
          font-size: 1.1em;
        }
        
        .status {
          background: #f0f9ff;
          border-left: 4px solid #0ea5e9;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        
        .status-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .status-item:last-child {
          border-bottom: none;
        }
        
        .status-label {
          font-weight: 600;
          color: #555;
        }
        
        .status-value {
          color: #0ea5e9;
          font-weight: 500;
        }
        
        .info-section {
          margin: 25px 0;
        }
        
        .info-section h2 {
          color: #333;
          font-size: 1.3em;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #667eea;
        }
        
        .endpoint {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin: 10px 0;
          font-family: 'Courier New', monospace;
          font-size: 0.95em;
          color: #333;
          word-break: break-all;
        }
        
        .endpoint strong {
          color: #667eea;
        }
        
        ul {
          list-style: none;
          padding-left: 0;
        }
        
        li {
          padding: 8px 0;
          padding-left: 25px;
          position: relative;
        }
        
        li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: bold;
        }
        
        .disclaimer {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
          font-size: 0.9em;
        }
        
        .disclaimer strong {
          color: #d97706;
        }
        
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          color: #666;
          font-size: 0.9em;
        }
        
        .footer a {
          color: #667eea;
          text-decoration: none;
        }
        
        .footer a:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 600px) {
          .container {
            padding: 25px;
          }
          
          h1 {
            font-size: 2em;
          }
          
          .status-item {
            flex-direction: column;
            gap: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 NVIDIA NIM Proxy</h1>
          <p class="subtitle">OpenAI-Compatible API Gateway</p>
        </div>
        
        <div class="status">
          <div class="status-item">
            <span class="status-label">Status:</span>
            <span class="status-value">✅ Online</span>
          </div>
          <div class="status-item">
            <span class="status-label">Total Requests:</span>
            <span class="status-value">${totalRequests.toLocaleString()}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Default Model:</span>
            <span class="status-value">${DEFAULT_CONFIG.model}</span>
          </div>
        </div>
        
        <div class="info-section">
          <h2>📡 API Endpoint</h2>
          <div class="endpoint">
            <strong>Base URL:</strong> ${req.protocol}://${req.get('host')}/v1
          </div>
        </div>
        
        <div class="info-section">
          <h2>✨ Features</h2>
          <ul>
            <li>OpenAI-compatible API format</li>
            <li>Automatic message cleaning and formatting</li>
            <li>Support for custom API keys and models</li>
            <li>Optimized for Janitor AI integration</li>
            <li>Enhanced payload limits for Render deployment</li>
            <li>Real-time request tracking</li>
          </ul>
        </div>
        
        <div class="info-section">
          <h2>🔧 Usage with Janitor AI</h2>
          <div class="endpoint">
            <strong>API URL:</strong> ${req.protocol}://${req.get('host')}/v1<br>
            <strong>API Key:</strong> Your NVIDIA NIM API Key<br>
            <strong>Model:</strong> meta/llama-3.1-8b-instruct (or any NIM model)
          </div>
        </div>
        
        <div class="disclaimer">
          <strong>⚠️ DISCLAIMER:</strong> Use this service at your own risk. We are not liable for any damages that may occur in case of security failure. Rest assured, we do not store your API keys.
        </div>
        
        <div class="footer">
          <p>Created by <strong>NulliME0NulliMW</strong> aka <strong>prudent elevator</strong></p>
          <p style="margin-top: 10px;">Vibecoded with Claude 🤖</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    totalRequests,
    uptime: process.uptime()
  });
});

// OpenAI-compatible chat completions endpoint
app.post('/v1/chat/completions', async (req, res) => {
  try {
    totalRequests++;
    
    console.log('📨 Received request from Janitor AI');
    
    // Extract API key from headers (OpenAI format)
    const apiKey = req.headers.authorization?.replace('Bearer ', '') || DEFAULT_CONFIG.defaultApiKey;
    
    if (!apiKey) {
      console.error('❌ No API key provided');
      return res.status(401).json({
        error: {
          message: 'No API key provided',
          type: 'invalid_request_error',
          code: 'invalid_api_key'
        }
      });
    }
    
    // Extract request parameters
    const {
      messages,
      model = DEFAULT_CONFIG.model,
      temperature = 0.7,
      max_tokens = 1024,
      stream = false,
      top_p = 1,
      frequency_penalty = 0,
      presence_penalty = 0
    } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      console.error('❌ Invalid messages format');
      return res.status(400).json({
        error: {
          message: 'Messages must be provided as an array',
          type: 'invalid_request_error'
        }
      });
    }
    
    // Clean messages for NVIDIA NIM
    const cleanedMessages = cleanMessagesForNIM(messages);
    console.log('✨ Cleaned', cleanedMessages.length, 'messages');
    
    // Prepare NVIDIA NIM request
    const nimRequest = {
      model,
      messages: cleanedMessages,
      temperature,
      max_tokens,
      stream,
      top_p
    };
    
    console.log('🚀 Sending to NVIDIA NIM with model:', model);
    
    // Make request to NVIDIA NIM
    const response = await axios.post(
      `${DEFAULT_CONFIG.baseURL}/chat/completions`,
      nimRequest,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );
    
    console.log('✅ Response from NVIDIA NIM received');
    
    // Return OpenAI-compatible response
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ Proxy Error:', error.message);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
    
    if (error.response) {
      // Forward error from NVIDIA NIM
      res.status(error.response.status).json({
        error: {
          message: error.response.data?.error?.message || error.message,
          type: error.response.data?.error?.type || 'api_error',
          code: error.response.data?.error?.code || 'unknown_error'
        }
      });
    } else {
      // Internal proxy error
      res.status(500).json({
        error: {
          message: 'Proxy server error',
          type: 'internal_error',
          details: error.message
        }
      });
    }
  }
});

// Models endpoint (OpenAI-compatible)
app.get('/v1/models', async (req, res) => {
  try {
    const apiKey = req.headers.authorization?.replace('Bearer ', '') || DEFAULT_CONFIG.defaultApiKey;
    
    const response = await axios.get(
      `${DEFAULT_CONFIG.baseURL}/models`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: {
        message: 'Failed to fetch models',
        type: 'api_error'
      }
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NVIDIA NIM Proxy running on port ${PORT}`);
  console.log(`📊 Total requests: ${totalRequests}`);
});
