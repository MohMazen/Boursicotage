import axios from 'axios';

// ── Base URL — dynamique selon le mode de connexion ─────────────────────────
// En mode hôte : utilise le proxy Vite (/api → localhost:3000/api)  
// En mode rejoindre : utilise l'IP stockée dans localStorage
function getBaseURL() {
    const serverIP = localStorage.getItem('boursicotage_server_ip');
    if (serverIP && serverIP !== 'localhost') {
        return `http://${serverIP}:3000/api`;
    }
    return '/api';
}

const api = axios.create({
    baseURL: getBaseURL(),
    headers: { 'Content-Type': 'application/json' },
});

// Met à jour la baseURL quand l'IP change
export const setServerIP = (ip) => {
    localStorage.setItem('boursicotage_server_ip', ip);
    if (ip && ip !== 'localhost') {
        api.defaults.baseURL = `http://${ip}:3000/api`;
    } else {
        api.defaults.baseURL = '/api';
    }
};

// ── Gestion du Token de Session ─────────────────────────────────────────────
// Permet de s'assurer qu'on récupère bien SA propre session et pas celle d'un autre
function getSessionToken() {
    let token = localStorage.getItem('boursicotage_session_token');
    if (!token) {
        token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('boursicotage_session_token', token);
    }
    return token;
}

// ── Joueurs ──────────────────────────────────────────────────────────────────
export const ajouterJoueur = (name) => 
    api.post('/joueurs', { name, sessionToken: getSessionToken() });
export const getPortefeuille    = (playerId) => api.get(`/joueurs/${playerId}/portefeuille`);
export const getHistorique      = (playerId) => api.get(`/joueurs/${playerId}/historique`);

// ── Partie ───────────────────────────────────────────────────────────────────
export const demarrerPartie     = () => api.post('/game/start');
export const terminerPartie     = () => api.post('/game/end');
export const getEtatPartie      = () => api.get('/game/state');
export const getClassement      = () => api.get('/game/classement');

// ── Marché ───────────────────────────────────────────────────────────────────
export const getActions         = () => api.get('/market/actions');
export const getDernierEvenement = () => api.get('/market/evenement');
export const getStocksHistory   = () => api.get('/stocks/history');

// ── Transactions ─────────────────────────────────────────────────────────────
export const acheterAction = (playerId, actionId, quantite) =>
    api.post('/market/acheter', { playerId, actionId, quantite });
export const vendreAction  = (playerId, actionId, quantite) =>
    api.post('/market/vendre', { playerId, actionId, quantite });

// ── Actions spéciales ────────────────────────────────────────────────────────
export const repandreRumeur = (playerId, actionId, positif) =>
    api.post('/market/rumeur', { playerId, actionId, positif });
export const gelerJoueur    = (playerId, cibleId) =>
    api.post('/market/geler', { playerId, cibleId });
export const insiderTrading = (playerId, actionId) =>
    api.post('/market/insider', { playerId, actionId });

// ── Short Selling ────────────────────────────────────────────────────────────
export const ouvrirShort  = (playerId, actionId, quantite) =>
    api.post('/market/short/ouvrir', { playerId, actionId, quantite });
export const fermerShort  = (playerId, actionId, quantite) =>
    api.post('/market/short/fermer', { playerId, actionId, quantite });
export const getShortPositions = (playerId) =>
    api.get(`/market/short/${playerId}`);

// ── Serveur Info ─────────────────────────────────────────────────────────────
export const getServerInfo = () => api.get('/server-info');

// ── Lobby ────────────────────────────────────────────────────────────────────
export const setPlayerReady = (playerId, ready) =>
    api.post('/game/ready', { playerId, ready });

export default api;
