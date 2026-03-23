import { io } from 'socket.io-client';

// Singleton Socket.IO — se connecte automatiquement via le proxy Vite
// En dev  : le proxy Vite redirige /socket.io → http://localhost:3000
// En prod : même origine
const socket = io({
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
});

socket.on('connect', () => {
    console.log('[SOCKET] Connecté au serveur :', socket.id);
});

socket.on('disconnect', (reason) => {
    console.log('[SOCKET] Déconnecté :', reason);
});

socket.on('connect_error', (err) => {
    console.error('[SOCKET] Erreur de connexion :', err.message);
});

export default socket;
