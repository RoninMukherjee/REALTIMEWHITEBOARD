const express = require('express');
const { Server } = require('socket.io'); // Import Socket.IO
const http = require('http');
const path = require('path');
const cors = require('cors'); // Import CORS middleware

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Allow requests from the frontend
    methods: ['GET', 'POST'],
  },
});

let canvasState = [];

// Enable CORS for all HTTP requests
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from frontend
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Serve React static files
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send existing canvas state to the new client
  socket.emit('INITIAL_STATE', canvasState);

  // Handle incoming draw events
  socket.on('DRAW', (data) => {
    console.log('Draw received:', data);

    // Save the drawing to canvas state
    canvasState.push(data);

    // Broadcast the drawing to other connected clients
    socket.broadcast.emit('DRAW', data);
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// Start the server
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
