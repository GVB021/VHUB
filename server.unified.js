import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import UltimoHub server if available
let ultimoHubServer;
try {
  ultimoHubServer = await import('./ultimohub/server/index.js');
} catch (error) {
  console.warn('UltimoHub server could not be imported:', error.message);
}

// Create Express app
const app = express();
const httpServer = createServer(app);

// Create WebSocket server for UltimoHub
const wss = new WebSocketServer({ 
  server: httpServer,
  path: '/ws/video-sync'
});

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const sessionId = url.searchParams.get('sessionId');
  
  console.log(`WebSocket connection established for session: ${sessionId}`);
  
  // Add session to client object for reference
  ws.sessionId = sessionId;
  
  // Handle messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Broadcast to all clients in the same session
      wss.clients.forEach((client) => {
        if (client.sessionId === sessionId && client.readyState === 1) {
          client.send(message);
        }
      });
      
      // Log certain events for debugging
      if (data.type === 'sync:request-state' || data.type === 'video-play' || data.type === 'video-pause') {
        console.log(`[WebSocket] ${data.type} event for session ${sessionId}`);
      }
    } catch (e) {
      console.error('Error processing WebSocket message:', e);
    }
  });
  
  // Handle connection close
  ws.on('close', () => {
    console.log(`WebSocket connection closed for session: ${sessionId}`);
  });
  
  // Send initial connection confirmation
  ws.send(JSON.stringify({ 
    type: 'connection:established',
    sessionId,
    timestamp: Date.now()
  }));
});

// Environment variables
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Supabase client for API routes
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.supabase.co", "wss://*.supabase.co"],
    },
  },
}));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Serve static files from the main application
app.use(express.static(path.join(__dirname, 'dist')));

// Serve static files from the voz-&-carreira application
const vozCarreiraPath = path.join(__dirname, 'voz-&-carreira---portal-de-dublagem', 'dist');
if (fs.existsSync(vozCarreiraPath)) {
  app.use('/voz-carreira', express.static(vozCarreiraPath));
}

// Serve UltimoHub static files if available
const ultimoHubClientPath = path.join(__dirname, 'ultimohub', 'client', 'dist');
if (fs.existsSync(ultimoHubClientPath)) {
  app.use('/ultimohub', express.static(ultimoHubClientPath));
}

// API routes for the main application
app.use('/api', (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  const healthcheck = {
    status: 'ok',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      main: fs.existsSync(path.join(__dirname, 'dist', 'index.html')),
      vozCarreira: fs.existsSync(vozCarreiraPath),
      ultimoHub: fs.existsSync(ultimoHubClientPath),
      database: Boolean(supabase),
      websocket: wss.clients ? true : false
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
    }
  };
  
  res.status(200).json(healthcheck);
});

// API endpoint for creating Daily.co rooms
app.post('/api/create-room', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    // In a real implementation, you would call the Daily.co API here
    // For now, we'll just return a mock URL
    const roomUrl = `https://your-domain.daily.co/${sessionId}`;
    
    res.json({ url: roomUrl });
  } catch (error) {
    console.error('Error creating Daily.co room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// API endpoint for audio takes
app.post('/api/sessions/:sessionId/takes', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { audioData, metadata } = req.body;
    
    if (!sessionId || !audioData || !metadata) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Store the take in Supabase
    if (supabase) {
      const { data, error } = await supabase
        .from('session_takes')
        .insert({
          session_id: sessionId,
          audio_data: audioData,
          metadata: metadata,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Broadcast to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.sessionId === sessionId && client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'take-completed',
            take: {
              id: data.id,
              sessionId,
              ...metadata
            }
          }));
        }
      });
      
      res.json({ id: data.id, success: true });
    } else {
      throw new Error('Database not available');
    }
  } catch (error) {
    console.error('Error saving take:', error);
    res.status(500).json({ error: 'Failed to save take' });
  }
});

// API endpoint to stream audio takes
app.get('/api/takes/:takeId/stream', async (req, res) => {
  try {
    const { takeId } = req.params;
    
    if (!takeId) {
      return res.status(400).json({ error: 'Take ID is required' });
    }
    
    // Get the take from Supabase
    if (supabase) {
      const { data, error } = await supabase
        .from('session_takes')
        .select('audio_data')
        .eq('id', takeId)
        .single();
      
      if (error) throw error;
      
      if (!data || !data.audio_data) {
        return res.status(404).json({ error: 'Take not found' });
      }
      
      // Convert base64 to buffer
      const audioBuffer = Buffer.from(data.audio_data, 'base64');
      
      // Set headers
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Length', audioBuffer.length);
      
      // Send the audio data
      res.send(audioBuffer);
    } else {
      throw new Error('Database not available');
    }
  } catch (error) {
    console.error('Error streaming take:', error);
    res.status(500).json({ error: 'Failed to stream take' });
  }
});

// Fallback route for the main application SPA
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Fallback route for the voz-carreira SPA
app.get('/voz-carreira/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'voz-&-carreira---portal-de-dublagem', 'dist', 'index.html'));
});

// Fallback route for the ultimohub SPA
app.get('/ultimohub/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'ultimohub', 'client', 'dist', 'index.html'));
});

// Start the server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
  console.log(`Main application: http://localhost:${PORT}/`);
  console.log(`Voz & Carreira: http://localhost:${PORT}/voz-carreira/`);
  console.log(`UltimoHub: http://localhost:${PORT}/ultimohub/`);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
