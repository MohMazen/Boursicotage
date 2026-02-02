/**
 * Transaction Routes
 * Routes pour la gestion des transactions (achats/ventes)
 */

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// POST /api/transactions/buy - Acheter des actions
router.post('/buy', transactionController.buyStock);

// POST /api/transactions/sell - Vendre des actions
router.post('/sell', transactionController.sellStock);

// GET /api/transactions - Historique des transactions
router.get('/', transactionController.getTransactionHistory);

module.exports = router;
