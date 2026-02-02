/**
 * Socket.IO Handler
 * Gère les connexions WebSocket et la communication temps réel
 * 
 * TODO: Actuellement utilise une instance unique de MarketEngine partagée.
 * Pour supporter plusieurs parties simultanées, il faudra créer une instance
 * de MarketEngine par partie et gérer leur cycle de vie.
 */

const MarketEngine = require('../services/MarketEngine');
const GameTimer = require('../services/GameTimer');
const EventEngine = require('../services/EventEngine');

const marketEngine = new MarketEngine();
const gameTimer = new GameTimer();
const eventEngine = new EventEngine();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ Client connecté : ${socket.id}`);

    // Envoyer l'état actuel du marché
    socket.emit('market:initial', marketEngine.getStocks());

    // Rejoindre une partie
    socket.on('game:join', ({ gameId, playerId }) => {
      socket.join(gameId);
      console.log(`👤 Joueur ${playerId} a rejoint la partie ${gameId}`);
      
      // Notifier les autres joueurs
      socket.to(gameId).emit('player:joined', { playerId });
    });

    // Démarrer une partie
    socket.on('game:start', ({ gameId }) => {
      console.log(`🎮 Démarrage de la partie ${gameId}`);
      
      // Générer le marché
      const stocks = marketEngine.generateMarket();
      io.to(gameId).emit('market:initial', stocks);
      
      // Démarrer le moteur de marché
      marketEngine.start(io);
      
      // Démarrer le générateur d'événements
      eventEngine.start(marketEngine, io);
      
      // Démarrer le timer de fin
      gameTimer.start(() => {
        io.to(gameId).emit('game:end');
        marketEngine.stop();
        eventEngine.stop();
      });
      
      io.to(gameId).emit('game:started');
    });

    // Achat d'action
    socket.on('transaction:buy', ({ gameId, playerId, stockId, quantity }) => {
      console.log(`💰 Achat : Joueur ${playerId} achète ${quantity}x ${stockId}`);
      // TODO: Valider la transaction et mettre à jour le portfolio
      io.to(gameId).emit('transaction:completed', { playerId, type: 'buy', stockId, quantity });
    });

    // Vente d'action
    socket.on('transaction:sell', ({ gameId, playerId, stockId, quantity }) => {
      console.log(`💸 Vente : Joueur ${playerId} vend ${quantity}x ${stockId}`);
      // TODO: Valider la transaction et mettre à jour le portfolio
      io.to(gameId).emit('transaction:completed', { playerId, type: 'sell', stockId, quantity });
    });

    // Déconnexion
    socket.on('disconnect', () => {
      console.log(`❌ Client déconnecté : ${socket.id}`);
    });
  });
};
