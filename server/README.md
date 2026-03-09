# 🚀 Boursicotage - Backend Server

API REST et serveur WebSocket pour la simulation boursière.

## 🚀 Installation

```bash
npm install
```

## 💻 Développement

```bash
npm run dev
```

Démarre le serveur sur [http://localhost:3000](http://localhost:3000) avec hot-reload (Nodemon)

## 🏗️ Production

```bash
npm start
```

## 🧪 Linting

```bash
npm run lint
```

## 📁 Structure

```
src/
├── config/          # Configuration (DB, env)
│   └── config.js
├── controllers/     # Logique métier API
│   ├── playerController.js
│   ├── gameController.js
│   └── transactionController.js
├── models/          # Structures de données
│   ├── Player.js
│   ├── Game.js
│   └── Stock.js
├── routes/          # Routes Express
│   ├── playerRoutes.js
│   ├── gameRoutes.js
│   └── transactionRoutes.js
├── services/        # Moteur de jeu
│   ├── MarketEngine.js
│   ├── GameTimer.js
│   └── EventEngine.js
├── socket/          # Gestion WebSocket
│   └── socketHandler.js
└── server.js        # Point d'entrée
```

## 🔧 Technologies

- **Express** : Framework web Node.js
- **Socket.IO** : Communication temps réel
- **CORS** : Gestion des requêtes cross-origin
- **Dotenv** : Variables d'environnement
- **Nodemon** : Hot-reload en développement

## 🌐 Routes API

### Players
- `GET /api/players` - Liste des joueurs
- `POST /api/players` - Créer un joueur
- `GET /api/players/:id` - Détails d'un joueur

### Games
- `GET /api/games` - Liste des parties
- `POST /api/games` - Créer une partie
- `GET /api/games/:id` - Détails d'une partie
- `POST /api/games/:id/join` - Rejoindre une partie
- `POST /api/games/:id/start` - Démarrer une partie

### Transactions
- `POST /api/transactions/buy` - Acheter des actions
- `POST /api/transactions/sell` - Vendre des actions
- `GET /api/transactions/:playerId` - Historique des transactions

## 🔌 Événements WebSocket

### Client → Server
- `join-game` - Rejoindre une partie
- `buy-stock` - Acheter des actions
- `sell-stock` - Vendre des actions
- `chat-message` - Envoyer un message

### Server → Client
- `game-update` - Mise à jour de l'état du jeu
- `market-update` - Mise à jour des cours
- `player-joined` - Nouveau joueur
- `player-left` - Joueur déconnecté
- `game-ended` - Fin de partie
