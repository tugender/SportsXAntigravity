import { io } from 'socket.io-client';

// In dev: Vite proxy handles /socket.io → port 3001
// In prod: same origin serves both React and Socket.io
const URL = import.meta.env.PROD ? window.location.origin : undefined;

export const socket = io(URL, {
  autoConnect: false,     // Connect only after username is confirmed
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
});
