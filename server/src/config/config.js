module.exports = {
  PORT: process.env.PORT || 3000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Configuration du jeu
  GAME_CONFIG: {
    MIN_PLAYERS: 2,
    MAX_PLAYERS: 8,
    INITIAL_CAPITAL: 10000,
    MIN_GAME_DURATION: 5 * 60 * 1000, // 5 minutes
    MAX_GAME_DURATION: 15 * 60 * 1000, // 15 minutes
  },
  
  // Configuration du marché
  MARKET_CONFIG: {
    UPDATE_INTERVAL: 100, // 100ms = 10 fois par seconde
    MIN_STOCKS: 10,
    MAX_STOCKS: 15,
  },
};
