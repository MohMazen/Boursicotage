import express       from 'express';
import { createServer } from 'http';
import { Server }    from 'socket.io';
import cors          from 'cors';
import playerRoutes      from './routes/playerRoutes.js';
import gameRoutes        from './routes/gameRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import game              from './instance/game_instance.js';

const app    = express();
const server = createServer(app);
const io     = new Server(server, {
    cors: { origin: '*' }                  // à restreindre en production
});

const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes REST ──────────────────────────────────────────────────────────────
app.use('/api', playerRoutes);
app.use('/api', gameRoutes);
app.use('/api', transactionRoutes);

app.get('/', (req, res) => res.json({ message: 'Boursicotage API — opérationnel ✅' }));

// ── Socket.IO — directement ici, c'est plus simple ──────────────────────────
io.on('connection', (socket) => {
    console.log(`[SOCKET] Client connecté : ${socket.id}`);

    // Envoie l'état initial au client qui vient de se connecter
    socket.emit('game:state', game.getGameState());

    socket.on('disconnect', () => {
        console.log(`[SOCKET] Client déconnecté : ${socket.id}`);
    });
});

// Passe l'objet io au MarketEngine pour qu'il émette les mises à jour en temps réel
// (sera activé quand game.demarrer() est appelé)
game.market._io = io;

// Callback appelé quand la partie se termine → notifie tous les clients
game.setOnGameEnd((classement) => {
    io.emit('game:end', { classement });
    console.log('[SOCKET] Fin de partie émise à tous les clients');
});

// ── Démarrage du serveur ─────────────────────────────────────────────────────
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`   API REST  → http://localhost:${PORT}/api`);
    console.log(`   Socket.IO → ws://localhost:${PORT}`);
});