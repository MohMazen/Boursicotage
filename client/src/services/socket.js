import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connecté au serveur Socket.IO');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Déconnecté du serveur');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // Écouter les mises à jour du marché
  onMarketUpdate(callback) {
    if (this.socket) {
      this.socket.on('market:update', callback);
    }
  }

  // Écouter l'état initial du marché
  onMarketInitial(callback) {
    if (this.socket) {
      this.socket.on('market:initial', callback);
    }
  }

  // Écouter les événements de jeu
  onGameEvent(callback) {
    if (this.socket) {
      this.socket.on('game:event', callback);
    }
  }

  // Écouter le démarrage de la partie
  onGameStarted(callback) {
    if (this.socket) {
      this.socket.on('game:started', callback);
    }
  }

  // Écouter la fin de la partie
  onGameEnd(callback) {
    if (this.socket) {
      this.socket.on('game:end', callback);
    }
  }

  // Rejoindre une partie
  joinGame(gameId, playerId) {
    if (this.socket) {
      this.socket.emit('game:join', { gameId, playerId });
    }
  }

  // Démarrer une partie
  startGame(gameId) {
    if (this.socket) {
      this.socket.emit('game:start', { gameId });
    }
  }

  // Acheter une action
  buyStock(gameId, playerId, stockId, quantity) {
    if (this.socket) {
      this.socket.emit('transaction:buy', { gameId, playerId, stockId, quantity });
    }
  }

  // Vendre une action
  sellStock(gameId, playerId, stockId, quantity) {
    if (this.socket) {
      this.socket.emit('transaction:sell', { gameId, playerId, stockId, quantity });
    }
  }
}

export default new SocketService();
