import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000'); // Connect to the backend server

function Whiteboard() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;
    canvas.style.border = '1px solid black';
    ctxRef.current = canvas.getContext('2d');

    // Receive initial canvas state
    socket.on('INITIAL_STATE', (state) => {
      console.log('Initial canvas state received:', state);
      state.forEach(draw => {
        drawOnCanvas(draw);
      });
    });

    // Receive draw data from other clients
    socket.on('DRAW', (data) => {
      console.log('Draw received:', data);
      drawOnCanvas(data);
    });

    return () => {
      socket.disconnect(); // Cleanup on component unmount
    };
  }, []);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();

    // Emit draw data to the server
    const drawData = { offsetX, offsetY };
    socket.emit('DRAW', drawData);
  };

  const drawOnCanvas = (data) => {
    const { offsetX, offsetY } = data;
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseUp={finishDrawing}
      onMouseMove={draw}
    />
  );
}

export default Whiteboard;
