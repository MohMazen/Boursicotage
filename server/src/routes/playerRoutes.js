/**
 * Player Routes
 * Routes pour la gestion des joueurs
 */

const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// POST /api/players - Créer un nouveau joueur
router.post('/', playerController.createPlayer);

// GET /api/players - Liste tous les joueurs
router.get('/', playerController.getAllPlayers);

// GET /api/players/:id - Récupère un joueur par son ID
router.get('/:id', playerController.getPlayerById);

// PUT /api/players/:id - Met à jour un joueur
router.put('/:id', playerController.updatePlayer);

module.exports = router;
