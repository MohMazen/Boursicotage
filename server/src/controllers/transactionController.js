/**
 * Transaction Controller
 * Gère les transactions d'achat et de vente d'actions
 */

const { players } = require('./playerController');

/**
 * Achète des actions
 */
const buyStock = (req, res) => {
  try {
    const { playerId, stockId, quantity, price } = req.body;
    
    if (!playerId || !stockId || !quantity || !price) {
      return res.status(400).json({ 
        error: 'playerId, stockId, quantity et price sont requis' 
      });
    }
    
    if (quantity <= 0) {
      return res.status(400).json({ error: 'La quantité doit être positive' });
    }
    
    const player = players.get(playerId);
    
    if (!player) {
      return res.status(404).json({ error: 'Joueur introuvable' });
    }
    
    const result = player.buyStock(stockId, quantity, price);
    
    res.json({
      success: true,
      transaction: {
        type: 'buy',
        playerId,
        stockId,
        quantity,
        price,
        totalCost: quantity * price,
      },
      player: {
        cash: result.newCash,
        quantity: result.newQuantity,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Vend des actions
 */
const sellStock = (req, res) => {
  try {
    const { playerId, stockId, quantity, price } = req.body;
    
    if (!playerId || !stockId || !quantity || !price) {
      return res.status(400).json({ 
        error: 'playerId, stockId, quantity et price sont requis' 
      });
    }
    
    if (quantity <= 0) {
      return res.status(400).json({ error: 'La quantité doit être positive' });
    }
    
    const player = players.get(playerId);
    
    if (!player) {
      return res.status(404).json({ error: 'Joueur introuvable' });
    }
    
    const result = player.sellStock(stockId, quantity, price);
    
    res.json({
      success: true,
      transaction: {
        type: 'sell',
        playerId,
        stockId,
        quantity,
        price,
        totalRevenue: quantity * price,
      },
      player: {
        cash: result.newCash,
        quantity: result.newQuantity,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Récupère l'historique des transactions
 */
const getTransactionHistory = (req, res) => {
  try {
    // TODO: Implémenter un système de stockage des transactions
    res.json({
      success: true,
      transactions: [],
      message: 'Fonctionnalité à implémenter',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  buyStock,
  sellStock,
  getTransactionHistory,
};
