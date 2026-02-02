import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour logger les requêtes
api.interceptors.request.use(
  (config) => {
    console.log(`➡️ ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour logger les réponses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`);
    return Promise.reject(error);
  }
);

// API Endpoints
export const playerAPI = {
  create: (playerData) => api.post('/players', playerData),
  getById: (id) => api.get(`/players/${id}`),
  getAll: () => api.get('/players'),
};

export const gameAPI = {
  create: (gameData) => api.post('/games', gameData),
  getById: (id) => api.get(`/games/${id}`),
  getAll: () => api.get('/games'),
  join: (gameId, playerId) => api.post(`/games/${gameId}/join`, { playerId }),
  start: (gameId) => api.post(`/games/${gameId}/start`),
};

export const transactionAPI = {
  buy: (playerId, stockId, quantity, price) => 
    api.post('/transactions/buy', { playerId, stockId, quantity, price }),
  sell: (playerId, stockId, quantity, price) => 
    api.post('/transactions/sell', { playerId, stockId, quantity, price }),
  getHistory: () => api.get('/transactions'),
};

export default api;
