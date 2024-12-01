const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

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

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'DRAW') {
      canvasState.push(data.draw);
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === 1) {
          client.send(JSON.stringify(data));
        }
      });
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
