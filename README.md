# 🎮 Boursicotage - Simulation Boursière Temps Réel

**Projet étudiant MIAGE 2024-2025** - Simulation de trading multijoueur en temps réel avec événements aléatoires et WebSockets.

---

## 📊 Vue d'ensemble

**Boursicotage** est une application web de simulation boursière temps réel permettant à 2-8 joueurs de s'affronter dans une course à l'enrichissement. Achats/ventes d'actions, fluctuations de marché, événements aléatoires : qui sera le meilleur trader ?

### 🎯 Objectifs pédagogiques

- **Architecture fullstack** : React + Node.js + Socket.IO
- **Temps réel** : Communication bidirectionnelle avec WebSockets
- **Logique métier** : Moteur de jeu, gestion d'événements
- **Travail en équipe** : Git workflow, code review, intégration continue

---

## 🏗️ Architecture technique

### Stack technologique

#### Frontend
- **React 18** : Interface utilisateur réactive
- **Vite** : Build tool et dev server ultra-rapide
- **Chart.js** : Graphiques en temps réel
- **Socket.IO Client** : Communication temps réel

#### Backend
- **Node.js + Express** : API REST
- **Socket.IO** : Serveur WebSocket
- **Architecture MVC** : Modèles, contrôleurs, routes

### Structure du monorepo

```
boursicotage-app/
├── client/          # Application React (Frontend)
├── server/          # API Node.js (Backend)
├── package.json     # Scripts globaux
└── README.md        # Ce fichier
```

---

## 🚀 Installation et démarrage

### Prérequis

- **Node.js** >= 18.x
- **npm** >= 9.x

### Installation

```bash
# Cloner le repository
git clone https://github.com/MohMazen/Boursicotage.git
cd Boursicotage

# Installer toutes les dépendances (root + client + server)
npm run install:all
```

### Configuration

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env si nécessaire (ports, URLs)
```

### Lancement en développement

```bash
# Démarrer client ET serveur simultanément
npm run dev

# OU séparément :
npm run dev:client   # http://localhost:5173
npm run dev:server   # http://localhost:3000
```

### Build de production

```bash
# Build du client
npm run build

# Démarrer le serveur
npm start
```

---

## 🎮 Fonctionnalités

### MVP (Version 1.0)

- ✅ **Lobby multijoueur** : Créer/rejoindre une partie
- ✅ **Marché temps réel** : 10 actions avec fluctuations automatiques
- ✅ **Transactions** : Achat/vente d'actions
- ✅ **Portefeuille** : Visualisation du capital et des positions
- ✅ **Classement** : Leaderboard en direct
- ✅ **Timer de partie** : Durée configurable (5-15 minutes)

### Extensions futures

- 📈 **Graphiques avancés** : Historique des cours
- 🎲 **Événements aléatoires** : Crash boursier, boom sectoriel
- 💬 **Chat en jeu** : Communication entre joueurs
- 🏆 **Système de succès** : Badges et récompenses
- 📊 **Statistiques** : Historique des parties

---

## 👥 Équipe de développement

| Rôle | Nom | Responsabilités |
|------|-----|----------------|
| **Lead Fullstack** | MohMazen | Architecture, code review, intégration |
| **Dev Frontend** | TBD | Interface React, composants UI |
| **Dev Backend 1** | TBD | API REST, authentification |
| **Dev Backend 2** | TBD | Moteur de jeu, WebSockets |

---

## 🤝 Contribution

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour le workflow Git et les conventions de code.

### Workflow rapide

```bash
# Créer une branche
git checkout -b feature/nom-fonctionnalite

# Coder, commiter, pusher
git add .
git commit -m "feat: description"
git push origin feature/nom-fonctionnalite

# Créer une Pull Request vers develop
```

---

## 📁 Structure détaillée

### Client (`client/`)

```
client/
├── src/
│   ├── components/      # Composants React réutilisables
│   │   ├── Market/      # Tableau de marché
│   │   ├── Portfolio/   # Portefeuille joueur
│   │   └── Game/        # Salle de jeu
│   ├── pages/           # Pages principales
│   ├── services/        # API et Socket.IO
│   ├── App.jsx          # Composant racine
│   └── main.jsx         # Point d'entrée
├── public/              # Assets statiques
└── index.html           # Template HTML
```

### Server (`server/`)

```
server/
├── src/
│   ├── controllers/     # Logique métier (API)
│   ├── models/          # Structures de données
│   ├── routes/          # Routes Express
│   ├── services/        # Moteur de jeu
│   ├── socket/          # Gestion WebSocket
│   └── server.js        # Point d'entrée
└── package.json
```

---

## 🔧 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run install:all` | Installe toutes les dépendances |
| `npm run dev` | Lance client + serveur en parallèle |
| `npm run dev:client` | Lance uniquement le client (Vite) |
| `npm run dev:server` | Lance uniquement le serveur (Nodemon) |
| `npm run build` | Build le client pour la production |
| `npm start` | Démarre le serveur de production |

---

## 📝 License

MIT - Projet étudiant MIAGE 2024-2025

---

## 📞 Contact

- **Repository** : [github.com/MohMazen/Boursicotage](https://github.com/MohMazen/Boursicotage)
- **Lead** : MohMazen

---

**Bon trading ! 📈💰**