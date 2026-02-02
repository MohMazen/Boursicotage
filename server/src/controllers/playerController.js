/**
 * Player Controller
 * Gère les opérations CRUD sur les joueurs
 */

const Player = require('../models/Player');

// Stockage en mémoire (à remplacer par une vraie DB plus tard)
const players = new Map();

/**
 * Crée un nouveau joueur
 */
const createPlayer = (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Le nom est requis' });
    }
    
    const id = `PLAYER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const player = new Player(id, name);
    
    players.set(id, player);
    
    res.status(201).json({
      success: true,
      player: player.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupère un joueur par son ID
 */
const getPlayerById = (req, res) => {
  try {
    const { id } = req.params;
    const player = players.get(id);
    
    if (!player) {
      return res.status(404).json({ error: 'Joueur introuvable' });
    }
    
    res.json({
      success: true,
      player: player.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Liste tous les joueurs
 */
const getAllPlayers = (req, res) => {
  try {
    const allPlayers = Array.from(players.values()).map(p => p.toJSON());
    
    res.json({
      success: true,
      players: allPlayers,
      count: allPlayers.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Met à jour un joueur
 */
const updatePlayer = (req, res) => {
  try {
    const { id } = req.params;
    const player = players.get(id);
    
    if (!player) {
      return res.status(404).json({ error: 'Joueur introuvable' });
    }
    
    // TODO: Implémenter la mise à jour
    
    res.json({
      success: true,
      player: player.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPlayer,
  getPlayerById,
  getAllPlayers,
  updatePlayer,
  players, // Exporter pour l'utiliser ailleurs
};
