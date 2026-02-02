/**
 * Game Routes
 * Routes pour la gestion des parties
 */

const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// POST /api/games - Créer une nouvelle partie
router.post('/', gameController.createGame);

// GET /api/games - Liste toutes les parties
router.get('/', gameController.getAllGames);

// GET /api/games/:id - Récupère une partie par son ID
router.get('/:id', gameController.getGameById);

// POST /api/games/:id/join - Rejoint une partie
router.post('/:id/join', gameController.joinGame);

// POST /api/games/:id/start - Démarre une partie
router.post('/:id/start', gameController.startGame);

module.exports = router;
