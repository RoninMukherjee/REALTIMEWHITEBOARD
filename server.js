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

app.use(express.static(path.join(__dirname, 'frontend', 'build')));

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log('Message received:', message);

  
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });



  
  ws.send(JSON.stringify({ type: 'INITIAL_STATE', canvasState }));

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


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
