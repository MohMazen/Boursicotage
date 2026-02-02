# 🚀 Boursicotage - Server

Backend API Node.js + Express + Socket.IO pour la simulation boursière multijoueur.

## 📁 Structure

```
server/
├── src/
│   ├── config/
│   │   └── config.js              # Configuration (ports, variables)
│   ├── controllers/
│   │   ├── playerController.js     # Gestion des joueurs
│   │   ├── gameController.js       # Gestion des parties
│   │   └── transactionController.js # Transactions achat/vente
│   ├── models/
│   │   ├── Player.js              # Modèle Joueur
│   │   ├── Game.js                # Modèle Partie
│   │   └── Stock.js               # Modèle Action
│   ├── routes/
│   │   ├── playerRoutes.js        # Routes /api/players
│   │   ├── gameRoutes.js          # Routes /api/games
│   │   └── transactionRoutes.js   # Routes /api/transactions
│   ├── services/
│   │   ├── MarketEngine.js        # Moteur de fluctuation des prix
│   │   ├── GameTimer.js           # Timer aléatoire de fin
│   │   └── EventEngine.js         # Générateur d'événements
│   ├── socket/
│   │   └── socketHandler.js       # Gestion Socket.IO
│   └── server.js                  # Point d'entrée
├── .eslintrc.js
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Installation

```bash
npm install
```

## 🚀 Lancement

```bash
# Mode développement avec nodemon
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📡 API Endpoints

### Players

- `POST /api/players` - Créer un joueur
- `GET /api/players` - Liste des joueurs
- `GET /api/players/:id` - Récupérer un joueur
- `PUT /api/players/:id` - Mettre à jour un joueur

### Games

- `POST /api/games` - Créer une partie
- `GET /api/games` - Liste des parties
- `GET /api/games/:id` - Récupérer une partie
- `POST /api/games/:id/join` - Rejoindre une partie
- `POST /api/games/:id/start` - Démarrer une partie

### Transactions

- `POST /api/transactions/buy` - Acheter des actions
- `POST /api/transactions/sell` - Vendre des actions
- `GET /api/transactions` - Historique des transactions

## 🔌 Socket.IO Events

### Événements reçus (client → server)

- `game:join` - Rejoindre une partie
- `game:start` - Démarrer une partie
- `transaction:buy` - Acheter une action
- `transaction:sell` - Vendre une action

### Événements émis (server → client)

- `market:initial` - État initial du marché
- `market:update` - Mise à jour des prix (10/sec)
- `game:event` - Événement marché (krach, bull run, etc.)
- `game:started` - Partie démarrée
- `game:end` - Fin de partie
- `player:joined` - Joueur rejoint
- `transaction:completed` - Transaction terminée

## ⚙️ Configuration

Variables d'environnement (fichier `.env`) :

```env
PORT=3000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## 🧪 Tests

```bash
npm run lint
```

## 📚 Technologies

- **Express** - Framework API REST
- **Socket.IO** - WebSocket temps réel
- **CORS** - Cross-Origin Resource Sharing
- **Dotenv** - Variables d'environnement
- **Nodemon** - Auto-reload en développement
