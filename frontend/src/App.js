import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('ws://localhost:4000');

// Log connection status
socket.on('connect', () => {
  console.log('WebSocket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('WebSocket disconnected');
});

socket.on('connect_error', (err) => {
  console.error('WebSocket connection error:', err.message);
});


const App = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineWidth = 5;
    ctxRef.current = ctx;

    socket.on('message', (message) => {
      const data = JSON.parse(message);
      if (data.type === 'DRAW') {
        const { x, y, lastX, lastY } = data.draw;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    });

    return () => socket.disconnect();
  }, []);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const ctx = ctxRef.current;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
    socket.send(
      JSON.stringify({
        type: 'DRAW',
        draw: { x: offsetX, y: offsetY, lastX: ctx.lastX, lastY: ctx.lastY },
      })
    );
    ctx.lastX = offsetX;
    ctx.lastY = offsetY;
  };

  const stopDrawing = () => {
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseOut={stopDrawing}
      style={{ border: '1px solid black' }}
    />
  );
};

export default App;