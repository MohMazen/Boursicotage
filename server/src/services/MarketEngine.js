/**
 * MarketEngine - Moteur de simulation du marché boursier
 * Responsable de la génération des actions et de la fluctuation des prix
 */

class MarketEngine {
  constructor() {
    this.stocks = [];
    this.history = new Map();
    this.isRunning = false;
  }

  /**
   * Génère le marché initial avec 10-15 actions
   */
  generateMarket() {
    const companies = [
      { name: 'TechCorp', sector: 'tech', basePrice: 120, volatility: 1.5 },
      { name: 'PharmaCo', sector: 'pharma', basePrice: 200, volatility: 1.2 },
      { name: 'AutoMobile SA', sector: 'auto', basePrice: 80, volatility: 1.0 },
      { name: 'BankPlus', sector: 'bank', basePrice: 150, volatility: 0.8 },
      { name: 'EnergyPower', sector: 'energy', basePrice: 90, volatility: 1.3 },
      { name: 'FoodChain', sector: 'food', basePrice: 110, volatility: 0.9 },
      { name: 'TelecomNet', sector: 'telecom', basePrice: 130, volatility: 1.1 },
      { name: 'RetailGroup', sector: 'retail', basePrice: 75, volatility: 1.4 },
      { name: 'AeroSpace Inc', sector: 'aerospace', basePrice: 180, volatility: 1.6 },
      { name: 'MediaCorp', sector: 'media', basePrice: 95, volatility: 1.2 },
      { name: 'BuildTech', sector: 'construction', basePrice: 85, volatility: 1.0 },
      { name: 'GreenEnergy', sector: 'renewable', basePrice: 140, volatility: 1.7 },
      // TODO: Ajouter plus d'entreprises si nécessaire
    ];

    this.stocks = companies.map(company => ({
      id: this.generateId(),
      name: company.name,
      sector: company.sector,
      price: company.basePrice,
      previousPrice: company.basePrice,
      volatility: company.volatility,
      trend: Math.random() > 0.5 ? 'bullish' : 'bearish',
    }));

    console.log(`✅ Marché généré : ${this.stocks.length} actions`);
    return this.stocks;
  }

  /**
   * Démarre la simulation (fluctuation toutes les 100ms)
   */
  start(socketIO) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.fluctuate();
      socketIO.emit('market:update', this.stocks);
    }, 100); // 10 fois par seconde

    console.log('🚀 MarketEngine démarré');
  }

  /**
   * Calcule les nouvelles valeurs des actions
   */
  fluctuate() {
    this.stocks = this.stocks.map(stock => {
      // TODO: Implémenter l'algorithme de fluctuation avancé
      // Formule : nouveauPrix = prixActuel * (1 + variationAléatoire * volatilité)
      const randomChange = (Math.random() - 0.5) * 0.01; // -0.5% à +0.5%
      const newPrice = stock.price * (1 + randomChange * stock.volatility);

      return {
        ...stock,
        previousPrice: stock.price,
        price: Math.max(1, newPrice), // Prix minimum = 1
      };
    });
  }

  /**
   * Arrête la simulation
   */
  stop() {
    if (!this.isRunning) return;
    
    clearInterval(this.intervalId);
    this.isRunning = false;
    console.log('🛑 MarketEngine arrêté');
  }

  /**
   * Génère un ID unique
   */
  generateId() {
    return `STOCK_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Retourne toutes les actions
   */
  getStocks() {
    return this.stocks;
  }
}

module.exports = MarketEngine;
