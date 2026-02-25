const express = require('express');
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const app = express();
// IMPORTANT: For Railway, read credentials from environment variable
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const credentialsPath = path.join(__dirname, '../config/serviceAccountKey.json');
  fs.writeFileSync(credentialsPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
}
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize Google Cloud Text-to-Speech client
const client = new textToSpeech.TextToSpeechClient();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Text-to-Speech endpoint
app.post('/api/text-to-speech', async (req, res) => {
  try {
    const { text } = req.body;

    // Validate input
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (text.length > 5000) {
      return res.status(400).json({ error: 'Text must be less than 5000 characters' });
    }

    // Google Cloud TTS request
    const request = {
      input: { text: text },
      voice: {
        languageCode: 'en-IN', // English (India)
        name: 'en-IN-Standard-C', // Female voice (Priya)
        ssmlGender: 'FEMALE',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0,
      },
    };

    const [response] = await client.synthesizeSpeech(request);
    const audioContent = response.audioContent;

    // Send audio file
    res.set('Content-Type', 'audio/mpeg');
    res.set('Cache-Control', 'no-cache');
    res.send(audioContent);

  } catch (error) {
    console.error('Error in text-to-speech:', error);
    res.status(500).json({
      error: 'Failed to convert text to speech',
      message: error.message
    });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Unknown error'
  });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Production: https://ai-voice-production-d044.up.railway.app`);
});
