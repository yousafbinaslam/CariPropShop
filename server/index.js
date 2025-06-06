import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './config/supabase.js';
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import clientRoutes from './routes/clients.js';
import appointmentRoutes from './routes/appointments.js';
import paymentRoutes from './routes/payments.js';
import notificationRoutes from './routes/notifications.js';
import analyticsRoutes from './routes/analytics.js';
import { authenticateToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, port: 3002 });

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// WebSocket connection handling
const clients = new Set();

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection established');
  clients.add(ws);

  // Send initial connection confirmation
  ws.send(JSON.stringify({
    type: 'connection-established',
    message: 'WebSocket connection successful',
    timestamp: new Date().toISOString()
  }));

  // Send initial events
  ws.send(JSON.stringify({
    type: 'initial-events',
    events: generateInitialEvents()
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleWebSocketMessage(ws, data);
    } catch (error) {
      console.error('WebSocket message parsing error:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Broadcast to all connected clients
function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
}

// Handle WebSocket messages
function handleWebSocketMessage(ws, data) {
  switch (data.type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      break;
    case 'subscribe':
      // Handle subscription to specific events
      break;
    default:
      console.log('Unknown WebSocket message type:', data.type);
  }
}

// Generate initial events for new connections
function generateInitialEvents() {
  return [
    {
      id: Date.now().toString(),
      type: 'system',
      timestamp: new Date().toISOString(),
      data: { message: 'System online', action: 'status_update' },
      severity: 'info',
      source: 'server'
    }
  ];
}

// Real-time event simulation
setInterval(() => {
  const events = [
    {
      id: Date.now().toString(),
      type: 'performance',
      timestamp: new Date().toISOString(),
      data: {
        message: 'Performance check completed',
        details: {
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          responseTime: Math.random() * 1000
        }
      },
      severity: 'info',
      source: 'monitor'
    },
    {
      id: (Date.now() + 1).toString(),
      type: 'user_activity',
      timestamp: new Date().toISOString(),
      data: {
        message: 'User interaction detected',
        action: 'page_view',
        page: '/properties'
      },
      severity: 'info',
      source: 'frontend'
    }
  ];

  events.forEach(event => {
    broadcast({
      type: 'real-time-event',
      event
    });
  });
}, 5000);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// File upload endpoint
app.post('/api/upload', authenticateToken, upload.array('files', 10), (req, res) => {
  try {
    const files = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    }));

    res.json({
      success: true,
      files,
      message: 'Files uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Serve static files
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server running on port 3002`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

export { app, server, broadcast };