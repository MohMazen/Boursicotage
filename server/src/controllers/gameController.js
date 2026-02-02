/**
 * Game Controller
 * Gère les opérations CRUD sur les parties
 */

const Game = require('../models/Game');

// Stockage en mémoire (à remplacer par une vraie DB plus tard)
const games = new Map();

/**
 * Crée une nouvelle partie
 */
const createGame = (req, res) => {
  try {
    const { name, createdBy } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Le nom de la partie est requis' });
    }
    
    if (!createdBy) {
      return res.status(400).json({ error: 'L\'ID du créateur est requis' });
    }
    
    const id = `GAME_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const game = new Game(id, name, createdBy);
    
    games.set(id, game);
    
    res.status(201).json({
      success: true,
      game: game.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupère une partie par son ID
 */
const getGameById = (req, res) => {
  try {
    const { id } = req.params;
    const game = games.get(id);
    
    if (!game) {
      return res.status(404).json({ error: 'Partie introuvable' });
    }
    
    res.json({
      success: true,
      game: game.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Liste toutes les parties
 */
const getAllGames = (req, res) => {
  try {
    const allGames = Array.from(games.values()).map(g => g.toJSON());
    
    res.json({
      success: true,
      games: allGames,
      count: allGames.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Rejoint une partie
 */
const joinGame = (req, res) => {
  try {
    const { id } = req.params;
    const { playerId } = req.body;
    
    const game = games.get(id);
    
    if (!game) {
      return res.status(404).json({ error: 'Partie introuvable' });
    }
    
    const result = game.addPlayer(playerId);
    
    res.json({
      success: true,
      game: game.toJSON(),
      ...result,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Démarre une partie
 */
const startGame = (req, res) => {
  try {
    const { id } = req.params;
    const game = games.get(id);
    
    if (!game) {
      return res.status(404).json({ error: 'Partie introuvable' });
    }
    
    const result = game.start();
    
    res.json({
      success: true,
      game: game.toJSON(),
      ...result,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createGame,
  getGameById,
  getAllGames,
  joinGame,
  startGame,
  games, // Exporter pour l'utiliser ailleurs
};
