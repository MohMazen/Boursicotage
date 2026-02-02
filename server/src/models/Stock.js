/**
 * Stock Model
 * Représente une action boursière
 */

class Stock {
  constructor(id, name, sector, basePrice, volatility) {
    this.id = id;
    this.name = name;
    this.sector = sector;
    this.price = basePrice;
    this.previousPrice = basePrice;
    this.basePrice = basePrice;
    this.volatility = volatility;
    this.trend = 'neutral'; // bullish, bearish, neutral
    this.history = []; // Historique des prix
  }

  /**
   * Met à jour le prix de l'action
   */
  updatePrice(newPrice) {
    this.previousPrice = this.price;
    this.price = Math.max(1, newPrice); // Prix minimum de 1
    
    // Ajouter à l'historique
    this.history.push({
      price: this.price,
      timestamp: Date.now(),
    });
    
    // Garder seulement les 100 derniers prix
    if (this.history.length > 100) {
      this.history.shift();
    }
    
    // Déterminer la tendance
    this.updateTrend();
  }

  /**
   * Met à jour la tendance basée sur le prix précédent
   */
  updateTrend() {
    const change = this.price - this.previousPrice;
    
    if (change > 0) {
      this.trend = 'bullish';
    } else if (change < 0) {
      this.trend = 'bearish';
    } else {
      this.trend = 'neutral';
    }
  }

  /**
   * Calcule la variation en pourcentage
   */
  getChangePercent() {
    if (this.previousPrice === 0) return 0;
    return ((this.price - this.previousPrice) / this.previousPrice) * 100;
  }

  /**
   * Retourne un résumé de l'action
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      sector: this.sector,
      price: this.price,
      previousPrice: this.previousPrice,
      basePrice: this.basePrice,
      volatility: this.volatility,
      trend: this.trend,
      changePercent: this.getChangePercent(),
    };
  }
}

module.exports = Stock;
