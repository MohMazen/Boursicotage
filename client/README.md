# 🎨 Boursicotage - Client

Frontend React + Vite pour la simulation boursière multijoueur.

## 📁 Structure

```
client/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   ├── Market/
│   │   │   └── MarketBoard.jsx    # Affichage du marché boursier
│   │   ├── Portfolio/
│   │   │   └── Portfolio.jsx      # Portefeuille du joueur
│   │   └── Game/
│   │       └── GameRoom.jsx       # Salle de jeu principale
│   ├── pages/
│   │   ├── Home.jsx               # Page d'accueil
│   │   ├── Lobby.jsx              # Salle d'attente
│   │   └── Game.jsx               # Page de jeu
│   ├── services/
│   │   ├── api.js                 # Client API REST (Axios)
│   │   └── socket.js              # Client Socket.IO
│   ├── App.jsx                    # Composant racine
│   ├── App.css                    # Styles globaux
│   ├── index.css                  # Styles de base
│   └── main.jsx                   # Point d'entrée
├── .eslintrc.cjs
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🛠️ Installation

```bash
npm install
```

## 🚀 Lancement

```bash
# Mode développement avec Vite
npm run dev

# Build pour production
npm run build

# Preview du build
npm run preview
```

L'application démarre sur `http://localhost:5173`

## 🧩 Composants

### MarketBoard
Affiche le tableau du marché avec toutes les actions :
- Nom de l'entreprise
- Secteur d'activité
- Prix actuel
- Variation en %
- Tendance (bullish/bearish)

### Portfolio
Affiche le portefeuille du joueur :
- Cash disponible
- Actions détenues
- Valeur totale
- Interface d'achat/vente

### GameRoom
Salle de jeu principale qui combine :
- MarketBoard
- Portfolio
- Événements de jeu
- Statut de la partie

## 📄 Pages

### Home
- Page d'accueil
- Création d'un compte joueur
- Présentation du jeu

### Lobby
- Liste des parties disponibles
- Création d'une nouvelle partie
- Rejoindre une partie existante

### Game
- Page de jeu principale
- Affiche la GameRoom
- Connexion Socket.IO

## 🔌 Services

### api.js
Client HTTP pour les requêtes REST :
- `playerAPI` : Créer, récupérer joueurs
- `gameAPI` : Créer, rejoindre, démarrer parties
- `transactionAPI` : Acheter, vendre actions

### socket.js
Client WebSocket pour le temps réel :
- Connexion au serveur Socket.IO
- Écoute des mises à jour du marché
- Écoute des événements de jeu
- Émission des actions du joueur

## ⚙️ Configuration

Variables d'environnement (fichier `.env`) :

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## 🧪 Tests

```bash
npm run lint
```

## 📚 Technologies

- **React 18** - Framework UI avec Hooks
- **Vite** - Build tool ultra-rapide
- **Socket.IO Client** - WebSocket temps réel
- **Axios** - Client HTTP
- **Chart.js** - Graphiques boursiers (à implémenter)
- **react-chartjs-2** - Wrapper React pour Chart.js

## 🎨 Style

Le design utilise un thème sombre par défaut avec :
- CSS modules pour les composants
- Variables CSS personnalisables
- Design responsive

## 🔄 Routing

Simple routing basé sur `window.location` :
- `/` ou `/home` : Page d'accueil
- `/lobby` : Salle d'attente
- `/game?id=xxx` : Partie en cours

## 📝 TODO

- [ ] Implémenter Chart.js pour les graphiques temps réel
- [ ] Ajouter une page EndGame avec classement final
- [ ] Améliorer le design avec des animations
- [ ] Ajouter un système de notifications
- [ ] Implémenter un vrai router (React Router)
