# 🎮 Boursicotage - Simulation Boursière Multijoueur

> **Projet étudiant MIAGE 2024-2025** - Simulation boursière temps réel où les joueurs s'affrontent pour devenir le plus riche en gérant un portefeuille d'actions virtuelles. La particularité : **personne ne sait quand la partie se terminera !** ⏱️

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-black.svg)](https://socket.io/)

---

## 📖 Table des matières

- [Présentation](#-présentation)
- [Équipe et responsabilités](#-équipe-et-responsabilités)
- [Architecture technique](#-architecture-technique)
- [Installation](#-installation)
- [Scripts disponibles](#-scripts-disponibles)
- [Workflow Git](#-workflow-git)
- [Technologies](#-technologies)

---

## 🎯 Présentation

**Boursicotage** est un jeu multijoueur en temps réel où chaque joueur démarre avec un capital de départ et doit faire fructifier son portefeuille en achetant et vendant des actions.

### Fonctionnalités principales

- 🏦 **Marché boursier dynamique** : 10-15 actions avec fluctuations réalistes
- 📊 **Graphiques temps réel** : Visualisation des cours avec Chart.js
- 🎲 **Timer secret** : La partie se termine aléatoirement (5-15 minutes)
- ⚡ **Événements aléatoires** : Krach boursier, bull run, scandales...
- 👥 **Multijoueur** : Jusqu'à 8 joueurs par partie
- 💰 **Classement en direct** : Qui est le plus riche ?

### Règles du jeu

1. Chaque joueur commence avec **10 000€** de capital
2. Les prix fluctuent en temps réel (10 mises à jour/seconde)
3. Vous pouvez acheter/vendre à tout moment
4. **Attention** : La partie peut se terminer n'importe quand !
5. Le joueur avec le plus de capital (cash + valeur du portefeuille) gagne

---

## 👥 Équipe et responsabilités

### 🎯 Lead Fullstack - [@MohMazen](https://github.com/MohMazen)

**Rôle :** Architecture globale, fusion Front-Back, review des PRs

**Responsabilités :**
- ✅ Valider toutes les Pull Requests
- 🔗 Intégrer le Frontend avec le Backend (Socket.IO)
- 🔧 Gérer les conflits et la cohérence du code
- 📊 Superviser l'avancement du projet
- 🚀 Déployer les versions

**Workflow :**
- Review toutes les PRs avant merge
- Merge uniquement dans `develop`
- Décide des releases `develop` → `main`

---

### 🎨 Dev Front (UI)

**Rôle :** Interface utilisateur React

**Responsabilités :**
- 🎨 Créer les maquettes et composants React
- 📈 Intégrer Chart.js pour les graphiques boursiers temps réel
- 📱 Développer les pages : Home, Lobby, Game, EndGame
- 🧩 Créer les composants : MarketBoard, Portfolio, Notifications
- 💅 Gérer le design et l'UX

**Stack technique :**
- React 18 + Hooks
- Vite (build tool)
- Chart.js / react-chartjs-2
- Socket.IO-client (temps réel)
- Axios (API REST)

**Tâches principales :**
1. Page d'accueil et lobby
2. Composant MarketBoard avec graphiques
3. Composant Portfolio avec liste des actions
4. Intégration Socket.IO pour les mises à jour temps réel
5. Design responsive et animations

---

### ⚙️ Dev Back 1 (API)

**Rôle :** API REST et authentification

**Responsabilités :**
- 📦 Créer les modèles de données (Player, Game, Stock)
- 🛣️ Développer les routes Express (/api/players, /api/games, /api/transactions)
- 🔐 Gérer l'authentification des joueurs
- 💾 Implémenter la logique CRUD (Create, Read, Update, Delete)
- ✅ Valider les transactions (achats/ventes)

**Stack technique :**
- Node.js + Express
- CORS
- Dotenv (variables d'environnement)

**Tâches principales :**
1. Créer les modèles Player, Game, Stock
2. Routes /api/players (créer, récupérer joueur)
3. Routes /api/games (créer partie, rejoindre, lister)
4. Routes /api/transactions (acheter, vendre)
5. Middleware de validation des données

---

### 🎲 Dev Back 2 (Moteur)

**Rôle :** Logique métier et temps réel

**Responsabilités :**
- 🎰 Créer la classe `MarketEngine` (génération et fluctuation des prix)
- ⏱️ Implémenter le `GameTimer` (durée aléatoire de fin de partie)
- 💥 Développer l'`EventEngine` (événements marché aléatoires)
- 🔌 Gérer Socket.IO (diffusion des cours en temps réel)
- ⚡ Optimiser les performances temps réel (10 updates/seconde)

**Stack technique :**
- Node.js
- Socket.IO
- Algorithmes de simulation

**Tâches principales :**
1. Classe MarketEngine avec génération d'actions
2. Algorithme de fluctuation des prix (volatilité, tendances)
3. Classe GameTimer avec durée aléatoire
4. EventEngine pour événements marché (krach, bull run)
5. Socket.IO handler pour diffuser les mises à jour

---

## 🏗️ Architecture technique

### Monorepo

```
boursicotage/
├── client/          # Frontend React + Vite
├── server/          # Backend Node.js + Express
└── package.json     # Scripts globaux
```

### Communication

- **REST API** : Actions CRUD (créer partie, s'authentifier, acheter/vendre)
- **WebSocket (Socket.IO)** : Temps réel (cours boursiers, événements, timer)

### Flux de données

```
Client React
    ↕️ REST API (Axios)
    ↕️ WebSocket (Socket.IO)
Server Express + Socket.IO
    ↔️ MarketEngine (fluctuations)
    ↔️ GameTimer (fin de partie)
    ↔️ EventEngine (événements)
```

### Ports par défaut

- **Client** : `http://localhost:5173` (Vite dev server)
- **Server** : `http://localhost:3000` (Express + Socket.IO)

---

## 🚀 Installation

### Prérequis

- Node.js 18+ et npm
- Git

### Étapes

```bash
# 1. Cloner le repository
git clone https://github.com/MohMazen/Boursicotage.git
cd Boursicotage

# 2. Installer toutes les dépendances (root + client + server)
npm run install:all

# 3. Lancer le projet en mode développement
npm run dev
```

Le client sera accessible sur **http://localhost:5173**  
Le serveur tournera sur **http://localhost:3000**

---

## 📜 Scripts disponibles

### Scripts globaux (root)

```bash
npm run install:all    # Installe toutes les dépendances (root + client + server)
npm run dev            # Lance client et server en parallèle avec concurrently
npm run dev:client     # Lance uniquement le client React (Vite)
npm run dev:server     # Lance uniquement le server Node.js (nodemon)
npm run build          # Build du client pour production
npm start              # Lance le server en mode production
```

### Scripts client (dans /client)

```bash
npm run dev        # Lance Vite dev server (localhost:5173)
npm run build      # Build pour production (génère /dist)
npm run preview    # Preview du build de production
npm run lint       # Lint avec ESLint
```

### Scripts server (dans /server)

```bash
npm start          # Lance le serveur (node)
npm run dev        # Lance le serveur avec nodemon (auto-reload)
npm run lint       # Lint avec ESLint
```

---

## 🔄 Workflow Git

⚠️ **IMPORTANT** : Lire le fichier [CONTRIBUTING.md](./CONTRIBUTING.md) **AVANT** de commencer à coder !

### Résumé rapide

1. **Partir de develop**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/ma-feature
   ```

2. **Développer et committer**
   ```bash
   git add .
   git commit -m "feat: description"
   ```

3. **Pusher et créer une PR vers `develop`**
   ```bash
   git push origin feat/ma-feature
   ```
   Puis créer une Pull Request sur GitHub vers `develop` (PAS `main`)

4. **Attendre validation du Lead**
   - ⛔ Ne JAMAIS merger soi-même
   - ⛔ Ne JAMAIS push sur `main` ou `develop`

5. **Après merge : nettoyer**
   ```bash
   git checkout develop
   git pull origin develop
   git branch -d feat/ma-feature
   ```

### Règles strictes

- ❌ Pas de push direct sur `main`
- ❌ Pas de push direct sur `develop`
- ❌ Pas de merge de ses propres PRs
- ✅ Toujours créer une branche depuis `develop`
- ✅ Toujours créer une PR vers `develop`

---

## 🛠️ Technologies

### Frontend

| Technologie | Version | Usage |
|------------|---------|-------|
| React | 18.3 | Framework UI |
| Vite | 5.0 | Build tool |
| Chart.js | 4.4 | Graphiques boursiers |
| Socket.IO Client | 4.7 | WebSocket temps réel |
| Axios | 1.6 | Client HTTP |

### Backend

| Technologie | Version | Usage |
|------------|---------|-------|
| Node.js | 18+ | Runtime JavaScript |
| Express | 4.18 | Framework API REST |
| Socket.IO | 4.7 | WebSocket temps réel |
| CORS | 2.8 | Cross-Origin |
| Dotenv | 16.3 | Variables d'environnement |

### DevOps

| Outil | Usage |
|-------|-------|
| ESLint | Linting JavaScript/React |
| Nodemon | Auto-reload serveur |
| Concurrently | Lancer front+back simultanément |

---

## 📚 Ressources

- [Documentation React](https://react.dev/)
- [Documentation Vite](https://vitejs.dev/)
- [Documentation Express](https://expressjs.com/)
- [Documentation Socket.IO](https://socket.io/)
- [Documentation Chart.js](https://www.chartjs.org/)

---

## 📝 Licence

MIT © MIAGE 2024-2025

---

## 🎓 Contexte académique

Projet réalisé dans le cadre de la formation MIAGE 2024-2025.  
Objectif pédagogique : Développer une application full-stack temps réel en équipe avec Git/GitHub.

---

**Bon développement ! 🚀**