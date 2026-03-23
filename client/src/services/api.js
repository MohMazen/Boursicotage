import axios from 'axios';

// Base URL — en dev, le proxy Vite réécrit /api → http://localhost:3000/api
const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

// ── Joueurs ──────────────────────────────────────────────────────────────────
export const ajouterJoueur      = (name) => api.post('/joueurs', { name });
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

export default api;
