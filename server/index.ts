import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from the root .env file
console.log('Loading environment variables...');
console.log('Current directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV);

dotenv.config({ path: '.env' });

// Debug: Check if environment variables are loaded
const geminiKey = process.env.VITE_GEMINI_API_KEY;
console.log('VITE_GEMINI_API_KEY loaded:', geminiKey ? `${geminiKey.substring(0, 5)}...${geminiKey.substring(geminiKey.length - 3)}` : 'Not found');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Set default API key if not provided
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.warn('Warning: VITE_GEMINI_API_KEY is not set in .env file. Some features may not work.');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', port: PORT, apiKey: !!GEMINI_API_KEY });
});

// Gemini API proxy endpoint
app.post('/api/gemini', async (req, res) => {
  console.log('Received request to /api/gemini');
  console.log('Request headers:', req.headers);

  try {
    const { contents, generationConfig, safetySettings } = req.body;

    if (!contents) {
      console.error('Error: Missing required field: contents');
      return res.status(400).json({ error: 'Missing required field: contents' });
    }

    const requestApiKey = req.headers['x-api-key'];
    const apiKey = (Array.isArray(requestApiKey) ? requestApiKey[0] : requestApiKey) || GEMINI_API_KEY;

    if (!apiKey) {
      console.error('Error: No API key provided');
      return res.status(401).json({
        error: 'API key is required',
        details: 'Provide x-api-key header or set VITE_GEMINI_API_KEY on the server'
      });
    }

    const maskedKey = apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 3);
    console.log('Using API Key:', maskedKey);

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    const requestBody = {
      contents,
      generationConfig: generationConfig || { temperature: 0.7, maxOutputTokens: 2048 },
      safetySettings:
        safetySettings || [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
    };

    console.log('Forwarding request to Gemini API...');
    console.log('API URL:', apiUrl);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    // Try the request with full config first
    let response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // If that fails with 400, try a simpler format without generationConfig and safetySettings
    if (response.status === 400) {
      console.log('First attempt failed with 400, trying simpler format...');

      const simpleRequestBody = {
        contents: requestBody.contents
      };

      console.log('Simple request body:', JSON.stringify(simpleRequestBody, null, 2));

      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(simpleRequestBody)
      });
    }

    const responseText = await response.text();
    console.log('Gemini API response status:', response.status);
    console.log('Gemini API response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Gemini API raw response:', responseText);

    let responseJson: unknown;

    try {
      responseJson = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing Gemini API response:', parseError);
      console.error('Raw response:', responseText);
      return res.status(500).json({
        error: 'Error parsing Gemini API response',
        details: responseText,
        rawResponse: responseText
      });
    }

    if (!response.ok) {
      console.error('Gemini API Error:', responseJson);
      return res.status(response.status).json({
        error: 'Error calling Gemini API',
        status: response.status,
        statusText: response.statusText,
        details: responseJson,
        rawResponse: responseText
      });
    }

    res.json(responseJson);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  - GET  /api/health');
  console.log('  - POST /api/gemini');
});

export default app;
