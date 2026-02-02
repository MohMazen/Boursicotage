const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const config = require('./config/config');
const socketHandler = require('./socket/socketHandler');

// Routes
const playerRoutes = require('./routes/playerRoutes');
const gameRoutes = require('./routes/gameRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// Initialisation Express
const app = express();
const server = http.createServer(app);

// Configuration Socket.IO
const io = new Server(server, {
  cors: {
    origin: config.CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes API
app.use('/api/players', playerRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/transactions', transactionRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Boursicotage API is running' });
});

// Initialiser Socket.IO
socketHandler(io);

// Démarrage du serveur
server.listen(config.PORT, () => {
  console.log(`🚀 Server démarré sur le port ${config.PORT}`);
  console.log(`📡 Socket.IO prêt pour les connexions`);
  console.log(`🌐 Client URL autorisée : ${config.CLIENT_URL}`);
});

module.exports = { app, server, io };
