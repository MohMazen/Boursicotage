import express       from 'express';
import { createServer } from 'http';
import { Server }    from 'socket.io';
import cors          from 'cors';
import playerRoutes      from './routes/playerRoutes.js';
import gameRoutes        from './routes/gameRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import { initSocket }    from './socket/socketHandler.js';

const app    = express();
const server = createServer(app);          // http server partagé avec Socket.io
const io     = new Server(server, {
    cors: { origin: '*' }                  // à restreindre en production
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api', playerRoutes);
app.use('/api', gameRoutes);
app.use('/api', transactionRoutes);

app.get('/', (req, res) => res.json({ message: 'Boursicotage API — opérationnel' }));

// Initialise les WebSockets
initSocket(io);

server.listen(PORT,'0.0.0.0', () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});