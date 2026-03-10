# Boursicotage — API Documentation

## Sommaire
- [Installation](#installation)
- [Lancer le serveur](#lancer-le-serveur)
- [Flux de jeu](#flux-de-jeu)
- [REST API](#rest-api)
- [WebSocket (Socket.io)](#websocket-socketio)
- [Règles du jeu](#règles-du-jeu)
- [Formats de données](#formats-de-données)

---

## Installation

```bash
npm install
```

## Lancer le serveur

**Développement** (hot-reload avec Nodemon) :
```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`.

**Production** :
```bash
npm start
```

## Linting
```bash
npm run lint
```
---

## Flux de jeu

L'ordre à respecter pour une partie :

```
1. POST /api/joueurs        → inscrire Joueur 1
2. POST /api/joueurs        → inscrire Joueur 2
3. POST /api/game/start     → démarrer la partie
4. ... les joueurs tradent ...
5. La partie se termine automatiquement (durée aléatoire inconnue)
   OU POST /api/game/end    → terminer manuellement
6. GET /api/game/classement → consulter le classement final
```

> ⚠️ Si la partie est terminée et qu'un joueur appelle `/game/start` sans s'être réinscrit, il reçoit une erreur et le classement de la partie précédente reste consultable jusqu'à ce qu'un nouveau joueur s'inscrive.

---

## REST API

### Base URL
```
http://localhost:3000/api
```

---

### Joueurs

#### Inscrire un joueur
```
POST /joueurs
```
**Body :**
```json
{ "name": "Alice" }
```
**Réponse :**
```json
{
    "message": "Joueur ajouté",
    "joueur": {
        "id": 1001,
        "name": "Alice"
    }
}
```
> ℹ️ Les IDs commencent à 1001 et s'incrémentent. Le premier joueur à s'inscrire après une partie terminée déclenche un reset automatique.

---

#### Consulter le portefeuille d'un joueur
```
GET /joueurs/:playerId/portefeuille
```
**Réponse :**
```json
{
    "solde": 9500.00,
    "portefeuille": {
        "1": {
            "nom": "TechCorp",
            "quantite": 5,
            "prixActuel": 105.20,
            "prixMoyenAchat": 100.00,
            "valeurTotale": 526.00,
            "plusValueLatente": 26.00,
            "pourcentageEvolution": 5.20
        }
    },
    "patrimoine": 10026.00
}
```

---

#### Consulter l'historique des transactions d'un joueur
```
GET /joueurs/:playerId/historique
```
**Réponse :**
```json
{
    "historique": [
        {
            "type": "achat",
            "actionId": 1,
            "actionNom": "TechCorp",
            "quantite": 5,
            "prixUnitaire": 100.00,
            "total": 500.00,
            "timestamp": "14:32:10"
        },
        {
            "type": "vente",
            "actionId": 1,
            "actionNom": "TechCorp",
            "quantite": 3,
            "prixUnitaire": 105.20,
            "total": 315.60,
            "plusValue": 15.60,
            "timestamp": "14:35:22"
        }
    ]
}
```

---

### Partie

#### Démarrer la partie
```
POST /game/start
```
> ⚠️ Nécessite au minimum 2 joueurs inscrits.

**Réponse succès :**
```json
{ "message": "Partie démarrée" }
```
**Réponse erreur :**
```json
{ "message": "Impossible de démarrer la partie (nombre de joueurs insuffisant)" }
```

---

#### Terminer la partie manuellement
```
POST /game/end
```
**Réponse :**
```json
{
    "message": "Partie terminée manuellement",
    "classement": [
        { "id": 1001, "name": "Alice", "solde": 9500.00, "patrimoine": 11200.00 },
        { "id": 1002, "name": "Bob",   "solde": 8200.00, "patrimoine": 9800.00 }
    ]
}
```

---

#### Consulter l'état de la partie
```
GET /game/state
```
**Réponse :**
```json
{
    "started": true,
    "finished": false,
    "nbJoueurs": 2,
    "tempsEcoule": "3m 42s",
    "dernierEvenement": {
        "actionId": 2,
        "actionNom": "BioLife",
        "evenement": "Rachat d'entreprise",
        "impact": 0.08,
        "timestamp": "14:33:00"
    },
    "classement": null
}
```
> ℹ️ `classement` est `null` pendant la partie, et contient le classement final une fois la partie terminée.
> ℹ️ La durée restante n'est pas exposée — elle est inconnue des joueurs (règle du jeu).

---

#### Consulter le classement final
```
GET /game/classement
```
> ⚠️ Disponible uniquement après la fin de la partie.

**Réponse :**
```json
{
    "classement": [
        { "id": 1001, "name": "Alice", "solde": 9500.00, "patrimoine": 11200.00 },
        { "id": 1002, "name": "Bob",   "solde": 8200.00, "patrimoine": 9800.00 }
    ]
}
```

---

### Marché

#### Consulter toutes les actions
```
GET /market/actions
```
**Réponse :**
```json
{
    "actions": [
        {
            "id": 1,
            "nom": "TechCorp",
            "prix": 104.50,
            "historique": [
                { "prix": 100.00, "timestamp": "14:30:00" },
                { "prix": 102.30, "timestamp": "14:30:03" }
            ]
        },
        { "id": 2, "nom": "BioLife",      "prix": 83.20,  "historique": [...] },
        { "id": 3, "nom": "EnergiePlus",  "prix": 118.90, "historique": [...] },
        { "id": 4, "nom": "CryptoX",      "prix": 47.60,  "historique": [...] },
        { "id": 5, "nom": "AgroSud",      "prix": 91.40,  "historique": [...] },
        { "id": 6, "nom": "MediFuture",   "prix": 112.70, "historique": [...] }
    ]
}
```
> ℹ️ La volatilité des actions n'est pas exposée — les joueurs ne la connaissent pas (règle du jeu).
> ℹ️ L'historique contient les 100 derniers points de cours.

---

#### Consulter le dernier événement de marché
```
GET /market/evenement
```
**Réponse :**
```json
{
    "evenement": {
        "actionId": 3,
        "actionNom": "EnergiePlus",
        "evenement": "Grève générale",
        "impact": -0.04,
        "timestamp": "14:34:00"
    }
}
```
> ⚠️ Un événement peut être un vrai événement de marché OU une rumeur déguisée — le frontend ne peut pas faire la différence, c'est voulu.

---

#### Acheter une action
```
POST /market/acheter
```
**Body :**
```json
{
    "playerId": 1001,
    "actionId": 1,
    "quantite": 5
}
```
**Réponse succès :**
```json
{
    "message": "Achat effectué avec succès",
    "solde": 9500.00,
    "portefeuille": { ... },
    "patrimoine": 10026.00
}
```
**Réponses erreur possibles :**
```json
{ "message": "Partie non démarrée" }
{ "message": "Solde insuffisant" }
{ "message": "Tu es gelé — impossible d'acheter pendant 45 secondes" }
{ "message": "Action introuvable" }
{ "message": "Joueur introuvable" }
```

---

#### Vendre une action
```
POST /market/vendre
```
**Body :**
```json
{
    "playerId": 1001,
    "actionId": 1,
    "quantite": 3
}
```
**Réponse succès :**
```json
{
    "message": "Vente effectuée avec succès",
    "solde": 9815.60,
    "portefeuille": { ... },
    "patrimoine": 10026.00
}
```
**Réponses erreur possibles :**
```json
{ "message": "Actions insuffisantes" }
{ "message": "Tu es gelé — impossible de vendre pendant 45 secondes" }
```

---

#### Répandre une rumeur
```
POST /market/rumeur
```
**Body :**
```json
{
    "playerId": 1001,
    "actionId": 2,
    "positif": true
}
```
> ⚠️ `positif` doit être un booléen JSON (`true` ou `false`, sans guillemets).

**Réponse succès :**
```json
{
    "success": true,
    "message": "Rumeur positive répandue sur BioLife",
    "solde": 9000.00,
    "rumeursRestantes": 2
}
```
**Réponses erreur possibles :**
```json
{ "message": "Solde insuffisant — la rumeur coûte 500 crédits" }
{ "message": "Tu as épuisé tes rumeurs pour cette partie" }
{ "message": "Cooldown actif — attends encore 45s" }
{ "message": "Tu es gelé — impossible d'utiliser une action spéciale" }
```

---

#### Geler un joueur adverse
```
POST /market/geler
```
**Body :**
```json
{
    "playerId": 1001,
    "cibleId": 1002
}
```
**Réponse succès :**
```json
{
    "success": true,
    "message": "Bob est gelé pendant 45 secondes",
    "solde": 8500.00,
    "gelsRestants": 1
}
```
**Réponses erreur possibles :**
```json
{ "message": "Solde insuffisant — le gel coûte 1000 crédits" }
{ "message": "Tu as épuisé tes gels pour cette partie" }
{ "message": "Ce joueur est déjà gelé" }
{ "message": "Tu ne peux pas te geler toi-même" }
{ "message": "Tu es gelé — impossible d'utiliser une action spéciale" }
```

---

## WebSocket (Socket.io)

### Connexion
```js
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000');
```

---

### Événements reçus depuis le serveur

#### `game:state`
Émis à la connexion d'un client. Donne l'état actuel de la partie.
```js
socket.on('game:state', ({ started, finished, nbJoueurs, tempsEcoule, dernierEvenement, classement }) => {
    // initialiser l'interface
});
```

---

#### `market:update`
Émis toutes les 3 secondes avec les cours mis à jour de toutes les actions. Également émis immédiatement après une rumeur.
```js
socket.on('market:update', ({ actions }) => {
    // mettre à jour les graphiques
});
```

---

#### `market:event`
Émis en temps réel quand un événement de marché se produit (vrai événement ou rumeur déguisée).
```js
socket.on('market:event', ({ evenement }) => {
    // afficher dans le fil d'actualité
    // evenement = { actionId, actionNom, evenement, impact, timestamp }
});
```

---

#### `player:update`
Émis uniquement au joueur concerné après une transaction, rumeur ou gel.
```js
socket.on('player:update', (result) => {
    if (result.success) {
        // mettre à jour solde, portefeuille, patrimoine
    } else {
        // afficher result.message en erreur
    }
});
```

---

#### `game:end`
Émis à tous les clients quand la partie se termine (automatiquement ou manuellement).
```js
socket.on('game:end', ({ classement }) => {
    // afficher l'écran de fin avec le classement
});
```

---

### Événements envoyés au serveur

#### Acheter via Socket
```js
socket.emit('player:buy', { playerId: 1001, actionId: 1, quantite: 5 });
```

#### Vendre via Socket
```js
socket.emit('player:sell', { playerId: 1001, actionId: 1, quantite: 3 });
```

#### Répandre une rumeur via Socket
```js
socket.emit('player:rumeur', { playerId: 1001, actionId: 2, positif: true });
```

> ℹ️ Les transactions peuvent passer soit par REST soit par Socket.io. Pour le temps réel, privilégier Socket.io.

---

## Règles du jeu

| Règle | Valeur |
|---|---|
| Solde initial | 10 000 crédits |
| Durée de la partie | Aléatoire entre 5 et 15 minutes — inconnue des joueurs |
| Coût d'une rumeur | 500 crédits |
| Rumeurs par partie | 3 maximum par joueur |
| Cooldown entre deux rumeurs | 1 minute |
| Durée d'effet d'une rumeur | 45 secondes puis correction automatique |
| Coût d'un gel | 1 000 crédits |
| Gels par partie | 2 maximum par joueur |
| Durée d'un gel | 45 secondes |
| Prix plancher d'une action | 1 crédit |
| Variation maximale par tick | ±10% |

---

## Formats de données

### Action (Stock)
```json
{
    "id": 1,
    "nom": "TechCorp",
    "prix": 104.50,
    "historique": [
        { "prix": 100.00, "timestamp": "14:30:00" }
    ]
}
```
> ℹ️ La volatilité n'est jamais exposée au client.

### Événement de marché
```json
{
    "actionId": 1,
    "actionNom": "TechCorp",
    "evenement": "Rachat d'entreprise",
    "impact": 0.08,
    "timestamp": "14:33:00"
}
```

### Entrée d'historique — Achat
```json
{
    "type": "achat",
    "actionId": 1,
    "actionNom": "TechCorp",
    "quantite": 5,
    "prixUnitaire": 100.00,
    "total": 500.00,
    "timestamp": "14:32:10"
}
```

### Entrée d'historique — Vente
```json
{
    "type": "vente",
    "actionId": 1,
    "actionNom": "TechCorp",
    "quantite": 3,
    "prixUnitaire": 105.20,
    "total": 315.60,
    "plusValue": 15.60,
    "timestamp": "14:35:22"
}
```