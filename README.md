# 🎮 Boursicotage - Simulation Boursière Temps Réel

**Projet étudiant MIAGE 2024-2025** - Simulation de trading multijoueur en temps réel avec événements aléatoires et WebSockets.

---

## 📊 Vue d'ensemble

**Boursicotage** est une application web de simulation boursière temps réel permettant à 2 joueurs ou plus de s'affronter dans une course à l'enrichissement. Achats/ventes d'actions, fluctuations de marché, événements aléatoires : qui sera le meilleur trader ?

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

... (109lignes restantes)

message.txt
6 Ko

# 📈 Boursicotage

> Simulation boursière en temps réel — Projet MIAGE 2024-2025

**Boursicotage** est un jeu de simulation boursière multijoueur en temps réel. Les joueurs s'affrontent en achetant et vendant des actions fictives dont les prix évoluent selon un modèle stochastique (GBM), en réagissant à des événements macroéconomiques et en usant d'actions spéciales pour prendre l'avantage.

message.txt
8 Ko
roninmazen — 21:34
👥 Équipe de développement
| Rôle | Nom | Responsabilités |
|------|-----|----------------|
| Lead Fullstack | CHAABANE Mohamed Mazen | Architecture, code review, intégration |
| Dev Frontend | MAZNI Mohand Ou Belkacem | Interface React, composants UI |
| Dev Backend 1 | BARRY Oumou Bailo | Modèle Player, routes API REST, authentification, logique de jeu |
| Dev Backend 2 | IDJOURDIKAN Ania | Moteur de jeu, WebSockets |

---

Mohand.31 — 21:35

# 📈 Boursicotage

> Simulation boursière en temps réel — Projet MIAGE 2024-2025

**Boursicotage** est un jeu de simulation boursière multijoueur en temps réel. Les joueurs s'affrontent en achetant et vendant des actions fictives dont les prix évoluent selon un modèle stochastique (GBM), en réagissant à des événements macroéconomiques et en usant d'actions spéciales pour prendre l'avantage.

message.txt
8 Ko

﻿

# 📈 Boursicotage

> Simulation boursière en temps réel — Projet MIAGE 2024-2025

**Boursicotage** est un jeu de simulation boursière multijoueur en temps réel. Les joueurs s'affrontent en achetant et vendant des actions fictives dont les prix évoluent selon un modèle stochastique (GBM), en réagissant à des événements macroéconomiques et en usant d'actions spéciales pour prendre l'avantage.

---

## ✨ Fonctionnalités

- **Multijoueur en temps réel** via Socket.IO (jusqu'à 6 joueurs)
- **Mode local** (plusieurs joueurs sur le même écran)
- **Marché dynamique** avec 5 actions fictives et un modèle GBM (Geometric Brownian Motion)
- **Événements aléatoires** : positifs, négatifs, sectoriels, neutres perturbateurs
- **Régimes de marché** : calme, normal, agité
- **Timer secret** : durée de partie aléatoire entre 3 et 8 minutes, avec signaux de tension progressifs
- **Actions spéciales** :
  - 📣 **Répandre une rumeur** — influence le prix d'une action
  - 🧊 **Geler un joueur** — empêche un adversaire de trader temporairement
  - 🔍 **Insider Trading** — obtenir un indice sur l'évolution future d'une action
  - 📉 **Short Selling** — parier sur la baisse d'une action
- **Classement final** avec détail du patrimoine de chaque joueur
- **QR Code** dans le lobby pour rejoindre facilement depuis un mobile

---

## 🗂️ Structure du projet

```
Boursicotage-main/
├── client/                  # Frontend React + Vite
│   └── src/
│       ├── pages/           # Home, Lobby, Game, LocalMultiplayer, Classement
│       ├── components/      # AnimatedBackground, MarketChart
│       ├── contexts/        # GameContext (état global Socket.IO)
│       └── services/        # api.js (Axios), socket.js
├── server/                  # Backend Node.js + Express
│   └── src/
│       ├── models/          # Game.js, Player.js, Stock.js
│       ├── controllers/     # gameController, playerController, transactionController
│       ├── routes/          # gameRoutes, playerRoutes, transactionRoutes
│       ├── services/        # MarketEngine.js, GameTimer.js
│       ├── instance/        # game_instance.js (singleton de la partie)
│       └── server.js        # Point d'entrée Express + Socket.IO
└── package.json             # Scripts racine (dev, build, start)
```

---

## 🚀 Installation & Lancement

### Prérequis

- [Node.js](https://nodejs.org/) v18+
- npm v9+

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/<votre-org>/Boursicotage.git
cd Boursicotage

# Installer toutes les dépendances (racine + client + serveur)
npm run install:all
```

### Développement (client + serveur en parallèle)

```bash
npm run dev
```

- Client : `http://localhost:5173`
- Serveur : `http://localhost:3000`

### Production

```bash
# Build du client
npm run build

# Démarrer le serveur
npm start
```

---

## 🎮 Comment jouer

1. **Ouvrir** l'application dans un navigateur (`http://localhost:5173`)
2. **Entrer un pseudo** et choisir le mode de jeu :
   - **Multijoueur réseau** — partager le QR code ou l'IP locale avec les autres joueurs
   - **Local** — plusieurs joueurs sur le même écran
3. Dans le **lobby**, passer son statut en "Prêt" ; la partie démarre dès que tous les joueurs sont prêts (minimum 2)
4. **Acheter et vendre** des actions pour maximiser son patrimoine
5. **Utiliser les actions spéciales** (rumeurs, gel, insider, short) de façon stratégique
6. La partie se termine à un moment aléatoire (entre 3 et 8 min) — des signaux de tension apparaissent dans les 60 dernières secondes
7. Le **classement final** classe les joueurs par patrimoine total

---

## ⚙️ API REST

Le serveur expose les endpoints suivants sur le port `3000` :

| Méthode | Route                      | Description                            |
| ------- | -------------------------- | -------------------------------------- |
| `GET`   | `/api/server-info`         | Infos du serveur (IP, joueurs, statut) |
| `GET`   | `/api/game/state`          | État actuel de la partie               |
| `POST`  | `/api/game/start`          | Démarrer la partie                     |
| `POST`  | `/api/game/end`            | Terminer la partie                     |
| `POST`  | `/api/game/leave`          | Quitter la partie                      |
| `POST`  | `/api/game/reset`          | Réinitialiser la partie                |
| `GET`   | `/api/game/classement`     | Classement des joueurs                 |
| `POST`  | `/api/game/ready`          | Passer en "Prêt" dans le lobby         |
| `GET`   | `/api/market/actions`      | Prix actuels des actions               |
| `GET`   | `/api/market/evenement`    | Dernier événement survenu              |
| `POST`  | `/api/market/rumeur`       | Répandre une rumeur                    |
| `POST`  | `/api/market/geler`        | Geler un joueur adverse                |
| `POST`  | `/api/market/insider`      | Obtenir une info d'insider             |
| `POST`  | `/api/market/short/ouvrir` | Ouvrir une position short              |
| `POST`  | `/api/market/short/fermer` | Fermer une position short              |
| `GET`   | `/api/stocks/history`      | Historique des prix                    |
| `POST`  | `/api/players`             | Créer un joueur                        |
| `POST`  | `/api/transactions/buy`    | Acheter une action                     |
| `POST`  | `/api/transactions/sell`   | Vendre une action                      |

---

## 🔌 Événements Socket.IO

| Événement       | Direction        | Description                        |
| --------------- | ---------------- | ---------------------------------- |
| `game:state`    | Serveur → Client | État complet de la partie          |
| `game:end`      | Serveur → Client | Fin de partie avec classement      |
| `game:tension`  | Serveur → Client | Signal de tension (niveau 1–3)     |
| `market:update` | Serveur → Client | Mise à jour des prix en temps réel |
| `market:event`  | Serveur → Client | Nouvel événement macro             |
| `market:regime` | Serveur → Client | Changement de régime de marché     |
| `lobby:update`  | Serveur → Client | Mise à jour des statuts du lobby   |
| `player:ready`  | Client → Serveur | Signal "prêt" du joueur            |

---

## 📦 Stack technique

| Couche             | Technologie                     |
| ------------------ | ------------------------------- |
| Frontend           | React 18, Vite, React Router v7 |
| Graphiques         | Chart.js, Recharts              |
| Animations         | Framer Motion                   |
| Temps réel         | Socket.IO (client + server)     |
| HTTP client        | Axios                           |
| Backend            | Node.js, Express 4              |
| Temps réel serveur | Socket.IO 4                     |
| Modèle de marché   | GBM (Geometric Brownian Motion) |

---

## 👤 Paramètres de départ d'un joueur

- **Solde initial** : 10 000 €
- **Rumeurs** : 3 utilisations par partie
- **Gels** : 2 utilisations par partie
- **Insider Trading** : limité (compteur par joueur)

---

## 📊 Actions disponibles

| Nom       | Prix initial | Secteur       | Volatilité  |
| --------- | ------------ | ------------- | ----------- |
| TechNova  | 150 €        | Tech          | Moyenne     |
| EnerGreen | 80 €         | Énergie verte | Faible      |
| CryptoX   | 200 €        | Crypto fictif | Très élevée |
| MediCorp  | 120 €        | Pharma        | Faible      |
| AgroFund  | 60 €         | Agriculture   | Très faible |

---

## 👥 Équipe de développement

Projet réalisé dans le cadre de la formation **MIAGE 2024-2025**.

| Rôle           | Nom                      | Responsabilités                                                  |
| -------------- | ------------------------ | ---------------------------------------------------------------- |
| Lead Fullstack | CHAABANE Mohamed Mazen   | Architecture, code review, intégration                           |
| Dev Frontend   | MAZNI Mohand Ou Belkacem | Interface React, composants UI                                   |
| Dev Backend 1  | BARRY Oumou Bailo        | Modèle Player, routes API REST, authentification, logique de jeu |
| Dev Backend 2  | IDJOURDIKAN Ania         | Moteur de jeu, WebSockets                                        |

---

## 📄 Licence

[MIT](LICENSE)
