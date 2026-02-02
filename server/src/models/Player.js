/**
 * Player Model
 * Représente un joueur dans le jeu
 */

class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.cash = 10000; // Capital de départ
    this.portfolio = {}; // { stockId: quantity }
    this.createdAt = new Date();
  }

  /**
   * Achète des actions
   */
  buyStock(stockId, quantity, price) {
    const cost = quantity * price;
    
    if (this.cash < cost) {
      throw new Error('Fonds insuffisants');
    }
    
    this.cash -= cost;
    this.portfolio[stockId] = (this.portfolio[stockId] || 0) + quantity;
    
    return {
      success: true,
      newCash: this.cash,
      newQuantity: this.portfolio[stockId],
    };
  }

  /**
   * Vend des actions
   */
  sellStock(stockId, quantity, price) {
    if (!this.portfolio[stockId] || this.portfolio[stockId] < quantity) {
      throw new Error('Quantité insuffisante');
    }
    
    const revenue = quantity * price;
    this.cash += revenue;
    this.portfolio[stockId] -= quantity;
    
    if (this.portfolio[stockId] === 0) {
      delete this.portfolio[stockId];
    }
    
    return {
      success: true,
      newCash: this.cash,
      newQuantity: this.portfolio[stockId] || 0,
    };
  }

  /**
   * Calcule la valeur totale du portefeuille
   */
  getTotalValue(stockPrices) {
    let portfolioValue = 0;
    
    for (const [stockId, quantity] of Object.entries(this.portfolio)) {
      const price = stockPrices[stockId] || 0;
      portfolioValue += quantity * price;
    }
    
    return this.cash + portfolioValue;
  }

  /**
   * Retourne un résumé du joueur
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      cash: this.cash,
      portfolio: this.portfolio,
      createdAt: this.createdAt,
    };
  }
}

module.exports = Player;
