# 🚀 NVIDIA NIM Proxy

OpenAI-compatible proxy server for NVIDIA NIM, optimized for Janitor AI integration.

## ✨ Features

- **OpenAI-Compatible API**: Drop-in replacement for OpenAI API endpoints
- **Message Cleaning**: Automatically strips HTML and formatting artifacts
- **Janitor AI Optimized**: Seamless integration with Janitor AI
- **Request Tracking**: Built-in counter for all-time requests
- **Enhanced Limits**: 50MB payload limit for Render deployment
- **Flexible Configuration**: Support for custom API keys and models

## 🚀 Quick Deploy to Render

1. **Fork this repository** or upload the files to your GitHub

2. **Create a new Web Service** on [Render](https://render.com)
   - Connect your GitHub repository
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Set Environment Variables** (Optional):
   - `NIM_API_KEY`: Your default NVIDIA NIM API key
   - `NIM_BASE_URL`: NVIDIA NIM base URL (default: https://integrate.api.nvidia.com/v1)

4. **Deploy!** Your proxy will be live at `https://your-app-name.onrender.com`

## 🔧 Usage with Janitor AI

Configure your Janitor AI with these settings:

- **API URL**: `https://your-app-name.onrender.com/v1`
- **API Key**: Your NVIDIA NIM API key
- **Model**: `meta/llama-3.1-8b-instruct` (or any NVIDIA NIM model)

## 📡 API Endpoints

### Chat Completions
```
POST /v1/chat/completions
```

### List Models
```
GET /v1/models
```

### Health Check
```
GET /health
```

## 🔑 Getting NVIDIA NIM API Key

1. Visit [NVIDIA AI](https://build.nvidia.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Generate a new API key

## 📦 Local Development

```bash
# Install dependencies
npm install

# Set environment variables (optional)
export NIM_API_KEY=your_key_here

# Start server
npm start
```

The server will run on `http://localhost:3000`

## ⚠️ Disclaimer

Use this service at your own risk. We are not liable for any damages that may occur in case of security failure. Rest assured, we do not store your API keys.

## 👨‍💻 Credits

Created by **NulliME0NulliMW** aka **prudent elevator**

Vibecoded with Claude 🤖

## 📄 License

MIT License - feel free to use and modify as needed!
