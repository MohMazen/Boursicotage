import express       from 'express';
import os            from 'os';
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
    cors: { origin: '*' }                  // accepte toutes les origines en dev
});

const PORT = process.env.PORT || 3000;

// ── Détection de l'IP locale ─────────────────────────────────────────────────
function getLocalIP() {
    const nets = os.networkInterfaces();

    // Interfaces prioritaires (Wi-Fi et Ethernet physique)
    const preferred = ['eth0', 'en0', 'en1', 'wlan0', 'Wi-Fi', 'Ethernet'];

    // Cherche d'abord dans les interfaces prioritaires
    for (const name of preferred) {
        const iface = nets[name];
        if (!iface) continue;
        for (const net of iface) {
            if (net.family === 'IPv4' && !net.internal) return net.address;
        }
    }

    //  Fallback : toute interface IPv4 non-interne dont le nom ne contient pas
    //    de marqueurs connus de VPN/virtuels
    const excluded = /vpn|veth|docker|vmware|vmnet|vbox|tun|tap|lo|utun|awdl|bridge/i;
    for (const name of Object.keys(nets)) {
        if (excluded.test(name)) continue;
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) return net.address;
        }
    }

    //  Dernier recours
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) return net.address;
        }
    }

    return 'localhost';
}
const LOCAL_IP = getLocalIP();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
// app.use(express.static(path.join(process.cwd(), '../client/dist')));

// ── Routes REST ──────────────────────────────────────────────────────────────
app.use('/api', playerRoutes);
app.use('/api', gameRoutes);
app.use('/api', transactionRoutes);

app.get('/', (req, res) => res.json({ message: 'Boursicotage API — opérationnel ✅' }));

// ── Route server-info ────────────────────────────────────────────────────────
app.get('/api/server-info', (req, res) => {
    res.json({
        ip:          LOCAL_IP,
        port:        PORT,
        playerCount: game.players.length,
        maxPlayers:  6,
        gameStatus:  game.started ? 'en_cours' : (game.finished ? 'terminee' : 'attente'),
        players:     game.getPlayers()
    });
});

// ── Route historique des prix ────────────────────────────────────────────────
app.get('/api/stocks/history', (req, res) => {
    res.json({ history: game.market.getStocksHistory() });
});

// ── Socket.IO ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
    console.log(`[SOCKET] Client connecté : ${socket.id}`);

    // Envoie l'état initial au client qui vient de se connecter
    socket.emit('game:state', {
        ...game.getGameState(),
        actions: game.market.getAllStocks(),
        history: game.market.getStocksHistory()
    });

    // ── Système de prêt du lobby ─────────────────────────────────────────
    socket.on('player:ready', (data) => {
        const { playerId, ready } = data;
        game.setPlayerReady(playerId, ready);
        // Notifier tous les clients de la mise à jour
        io.emit('lobby:update', { players: game.getPlayers() });
    });

    socket.on('disconnect', () => {
        console.log(`[SOCKET] Client déconnecté : ${socket.id}`);
    });
});

// Passe l'objet io au MarketEngine pour qu'il émette les mises à jour en temps réel
game.market._io = io;

// Callback appelé quand la partie commence → notifie tous les clients
game.setOnGameStart(() => {
    io.emit('game:state', {
        ...game.getGameState(),
        actions: game.market.getAllStocks(),
        history: game.market.getStocksHistory()
    });
    console.log('[SOCKET] Signal de démarrage envoyé à tous');
});

// Callback appelé quand la partie se termine → notifie tous les clients
game.setOnGameEnd((data) => {
    io.emit('game:end', data);
    console.log('[SOCKET] Fin de partie émise à tous les clients');
});

// ── Démarrage du serveur ─────────────────────────────────────────────────────
server.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║       BOURSICOTAGE — Serveur démarré         ║');
    console.log(`║   Hôte    : http://${LOCAL_IP}:${PORT}`.padEnd(48) + '║');
    console.log(`║   Local   : http://localhost:${PORT}`.padEnd(48) + '║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');
});