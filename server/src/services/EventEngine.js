/**
 * EventEngine - Générateur d'événements marché aléatoires
 * Génère des événements qui impactent le marché (krach, bull run, etc.)
 */

class EventEngine {
  constructor() {
    this.events = [
      {
        type: 'crash',
        name: 'Krach Boursier',
        description: 'Panique sur les marchés !',
        impact: -0.15, // -15%
        probability: 0.05,
      },
      {
        type: 'bull_run',
        name: 'Bull Run',
        description: 'Euphorie générale !',
        impact: 0.12, // +12%
        probability: 0.05,
      },
      {
        type: 'scandal',
        name: 'Scandale',
        description: 'Un scandale éclate dans une entreprise',
        impact: -0.25, // -25% pour une seule action
        probability: 0.08,
        targetSingle: true,
      },
      {
        type: 'good_news',
        name: 'Bonne Nouvelle',
        description: 'Annonce positive pour une entreprise',
        impact: 0.20, // +20% pour une seule action
        probability: 0.08,
        targetSingle: true,
      },
      {
        type: 'volatility',
        name: 'Volatilité Accrue',
        description: 'Le marché devient instable',
        impact: 0, // Augmente la volatilité
        probability: 0.10,
      },
    ];
    
    this.isRunning = false;
    this.intervalId = null;
  }

  /**
   * Démarre le générateur d'événements
   */
  start(marketEngine, socketIO, interval = 30000) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.triggerRandomEvent(marketEngine, socketIO);
    }, interval); // Par défaut toutes les 30 secondes

    console.log('🎲 EventEngine démarré');
  }

  /**
   * Déclenche un événement aléatoire
   */
  triggerRandomEvent(marketEngine, socketIO) {
    // Sélectionne un événement selon les probabilités
    const random = Math.random();
    let cumulativeProbability = 0;

    for (const event of this.events) {
      cumulativeProbability += event.probability;
      if (random < cumulativeProbability) {
        this.applyEvent(event, marketEngine, socketIO);
        return;
      }
    }
  }

  /**
   * Applique un événement au marché
   */
  applyEvent(event, marketEngine, socketIO) {
    console.log(`💥 Événement : ${event.name} - ${event.description}`);

    if (event.targetSingle) {
      // Impact sur une seule action
      const randomIndex = Math.floor(Math.random() * marketEngine.stocks.length);
      const stock = marketEngine.stocks[randomIndex];
      
      stock.price = Math.max(1, stock.price * (1 + event.impact));
      
      socketIO.emit('game:event', {
        type: event.type,
        name: event.name,
        description: `${event.description} : ${stock.name}`,
        affectedStock: stock.id,
      });
    } else {
      // Impact global
      marketEngine.stocks.forEach(stock => {
        if (event.type === 'volatility') {
          stock.volatility *= 1.5; // Augmente la volatilité
        } else {
          stock.price = Math.max(1, stock.price * (1 + event.impact));
        }
      });
      
      socketIO.emit('game:event', {
        type: event.type,
        name: event.name,
        description: event.description,
      });
    }
  }

  /**
   * Arrête le générateur d'événements
   */
  stop() {
    if (!this.isRunning) return;
    
    clearInterval(this.intervalId);
    this.isRunning = false;
    console.log('🛑 EventEngine arrêté');
  }
}

module.exports = EventEngine;
