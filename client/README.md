# 🎨 Boursicotage - Frontend Client

Application React pour la simulation boursière temps réel.

## 🚀 Installation

```bash
npm install
```

## 💻 Développement

```bash
npm run dev
```

Ouvre l'application sur [http://localhost:5173](http://localhost:5173)

## 🏗️ Build

```bash
npm run build
```

Génère les fichiers optimisés dans `dist/`

## 🧪 Linting

```bash
npm run lint
```

## 📁 Structure

```
src/
├── components/      # Composants réutilisables
│   ├── Market/      # MarketBoard.jsx
│   ├── Portfolio/   # Portfolio.jsx
│   └── Game/        # GameRoom.jsx
├── pages/           # Pages principales (Home, Lobby, Game)
├── services/        # API et Socket.IO
├── assets/          # Images, SVG
├── App.jsx          # Composant racine
├── App.css          # Styles globaux
├── index.css        # Reset CSS
└── main.jsx         # Point d'entrée
```

## 🔧 Configuration

- **Vite** : Build tool ultra-rapide
- **React 18** : Dernière version avec concurrent features
- **ESLint** : Linting avec règles React

## 🌐 Proxy API

Le dev server proxy automatiquement :
- `/api/*` → `http://localhost:3000/api/*`
- `/socket.io/*` → `http://localhost:3000/socket.io/*`
