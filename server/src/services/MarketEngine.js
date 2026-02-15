class MarketEngine {
    constructor() {
        // Configuration du marché
        this.stock = null;              // L'action unique
        this.history = [];              // Historique des prix [{ timestamp, price }]
        this.maxHistoryLength = 1000;   // Garder les 1000 dernières valeurs
        this.isRunning = false;         // État du moteur
        this.intervalId = null;         // ID de l'intervalle de mise à jour

        // Paramètres de simulation (modifiables)
        this.updateInterval = 100;      // Mise à jour toutes les 100ms (10 fois/seconde)
        this.deltaT = this.updateInterval / 1000; // Δt en secondes
    }

    /**
     * Génère le marché initial avec UNE seule action
     */
    generateMarket(config = {}) {
        const defaultConfig = {
            name: 'TechCorp',
            symbol: 'TECH',
            initialPrice: 100.0,        // S₀ = 100€
            mu: 0.05,                   // μ = 5% de rendement annuel espéré
            sigma: 0.20,                // σ = 20% de volatilité annuelle
        };

        const stockConfig = { ...defaultConfig, ...config };

        this.stock = {
            id: this.generateId(),
            name: stockConfig.name,
            symbol: stockConfig.symbol,
            price: stockConfig.initialPrice,
            previousPrice: stockConfig.initialPrice,
            mu: stockConfig.mu,               // Drift (tendance)
            sigma: stockConfig.sigma,         // Volatilité
            variation: 0,                     // Variation en %
            createdAt: Date.now(),
        };

        // Initialiser l'historique avec le prix initial
        this.history = [{
            timestamp: Date.now(),
            price: this.stock.price,
        }];

        console.log(`✅ Marché généré : ${this.stock.name} (${this.stock.symbol})`);
        console.log(`   Prix initial : ${this.stock.price.toFixed(2)}€`);
        console.log(`   Drift (μ) : ${(this.stock.mu * 100).toFixed(2)}%`);
        console.log(`   Volatilité (σ) : ${(this.stock.sigma * 100).toFixed(2)}%`);

        return this.stock;
    }

    /**
     * Démarre la simulation du marché
     */
    start(socketIO) {
        if (this.isRunning) {
            console.warn('⚠️  MarketEngine déjà démarré');
            return;
        }

        if (!this.stock) {
            throw new Error('❌ Aucune action générée. Appelez generateMarket() d\'abord.');
        }

        this.isRunning = true;
        console.log(`🚀 MarketEngine démarré (mise à jour toutes les ${this.updateInterval}ms)`);

        // Lancer la simulation avec setInterval
        this.intervalId = setInterval(() => {
            this.fluctuate();

            // Diffuser la mise à jour via Socket.IO
            if (socketIO) {
                socketIO.emit('market:update', {
                    stock: this.stock,
                    timestamp: Date.now(),
                });
            }
        }, this.updateInterval);
    }

    /**
     * Calcule le nouveau prix selon le Mouvement Brownien Géométrique
     * Formule : S(t+Δt) = S(t) × exp((μ - σ²/2)Δt + σε√Δt)
     */
    fluctuate() {
        if (!this.stock) return;

        const St = this.stock.price;              // Prix actuel
        const mu = this.stock.mu;                 // Drift (tendance)
        const sigma = this.stock.sigma;           // Volatilité
        const deltaT = this.deltaT;               // Δt (en secondes)
        const epsilon = this.randomNormal();      // ε ~ N(0,1)

        // Calcul du drift ajusté : (μ - σ²/2)Δt
        const driftTerm = (mu - (sigma ** 2) / 2) * deltaT;

        // Calcul du terme stochastique : σε√Δt
        const randomTerm = sigma * epsilon * Math.sqrt(deltaT);

        // Calcul du nouveau prix : S(t+Δt) = S(t) × exp(drift + random)
        const newPrice = St * Math.exp(driftTerm + randomTerm);

        // Mise à jour de l'action
        this.stock.previousPrice = St;
        this.stock.price = Math.max(0.01, newPrice); // Prix minimum = 0.01€

        // Calcul de la variation en %
        this.stock.variation = ((this.stock.price - this.stock.previousPrice) / this.stock.previousPrice) * 100;

        // Ajouter au historique
        this.history.push({
            timestamp: Date.now(),
            price: this.stock.price,
        });

        // Limiter la taille de l'historique
        if (this.history.length > this.maxHistoryLength) {
            this.history.shift(); // Retirer le plus ancien
        }
    }

    /**
     * Génère une variable aléatoire suivant une loi normale N(0,1)
     */
    randomNormal() {
        // Box-Muller transform pour générer N(0,1)
        let u1 = 0, u2 = 0;

        // Éviter u1 = 0 (car log(0) = -∞)
        while (u1 === 0) u1 = Math.random();
        while (u2 === 0) u2 = Math.random();

        // Transformation de Box-Muller
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

        return z0; // z0 suit une loi N(0,1)
    }

    /**
     * Arrête la simulation du marché
     */
    stop() {
        if (!this.isRunning) {
            console.warn('⚠️  MarketEngine déjà arrêté');
            return;
        }

        clearInterval(this.intervalId);
        this.isRunning = false;
        console.log('🛑 MarketEngine arrêté');
    }

    /**
     * Retourne l'action actuelle
     */
    getStock() {
        return this.stock;
    }

    /**
     * Retourne l'historique des prix
     */
    getHistory(limit = null) {
        if (limit && limit > 0) {
            return this.history.slice(-limit);
        }
        return this.history;
    }

    /**
     * Modifie les paramètres de l'action (μ, σ) en cours de simulation
     * Utile pour simuler des événements marché
     */
    updateParameters(newParams) {
        if (newParams.mu !== undefined) {
            this.stock.mu = newParams.mu;
            console.log(`📊 Drift (μ) modifié : ${(this.stock.mu * 100).toFixed(2)}%`);
        }
        if (newParams.sigma !== undefined) {
            this.stock.sigma = newParams.sigma;
            console.log(`📊 Volatilité (σ) modifiée : ${(this.stock.sigma * 100).toFixed(2)}%`);
        }
    }

    /**
     * Génère un ID unique pour l'action
     */
    generateId() {
        return `STOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Retourne les statistiques du marché
     */
    getStatistics() {
        if (this.history.length === 0) return null;

        const prices = this.history.map(h => h.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
        const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
        const stdDev = Math.sqrt(variance);

        return {
            min: min.toFixed(2),
            max: max.toFixed(2),
            mean: mean.toFixed(2),
            stdDev: stdDev.toFixed(2),
            dataPoints: prices.length,
        };
    }

    /**
     * Réinitialise le marché
     */
    reset() {
        this.stop();
        this.stock = null;
        this.history = [];
        console.log('🔄 MarketEngine réinitialisé');
    }
}

module.exports = MarketEngine;