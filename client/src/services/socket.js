import { io } from 'socket.io-client';

/**
 * Socket.IO — connexion dynamique selon le mode (hôte/rejoindre)
 *
 * En mode hôte  → proxy Vite (même origine)
 * En mode rejoindre → IP saisie par le joueur
 */
function getSocketURL() {
    const serverIP = localStorage.getItem('boursicotage_server_ip');
    if (serverIP && serverIP !== 'localhost') {
        return `http://${serverIP}:3000`;
    }
    return undefined; // même origine (proxy Vite)
}

let socket = null;

export function connectSocket() {
    if (socket && socket.connected) return socket;

    const url = getSocketURL();
    socket = io(url, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
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

    return socket;
}

export function reconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
    return connectSocket();
}

export function getSocket() {
    if (!socket) return connectSocket();
    return socket;
}

// Initialisation automatique
connectSocket();

export default socket;
