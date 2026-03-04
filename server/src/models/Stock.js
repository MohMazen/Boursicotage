class Stock {
    constructor(id, nom, prixInitial, volatilite = 'moyenne') {
        this.id = id;
        this.nom = nom;
        this.prix = prixInitial;
        this.prixInitial = prixInitial;
        this.volatilite = volatilite; // 'faible' | 'moyenne' | 'elevee' — inconnu des joueurs
        this.historique = [{ prix: prixInitial, timestamp: new Date().toLocaleTimeString('fr-FR') }];

        // Coefficients de variation selon volatilité (cachés aux joueurs)
        this._coefficients = {
            faible: 0.01,
            moyenne: 0.03,
            elevee: 0.07
        };
    }

    _getCoeff() {
        return this._coefficients[this.volatilite] || 0.03;
    }

    // Fait fluctuer le prix aléatoirement, avec un éventuel événement externe
    fluctuer(evenement = null) {
        const coeff = this._getCoeff();
        let variation = (Math.random() * 2 - 1) * coeff; // entre -coeff et +coeff

        if (evenement) {
            variation += evenement.impact;
        }

        // Le prix ne peut pas tomber en dessous de 1
        this.prix = Math.max(1, parseFloat((this.prix * (1 + variation)).toFixed(2)));

        this.historique.push({ prix: this.prix, timestamp: new Date().toLocaleTimeString('fr-FR') });

        // On conserve uniquement les 100 derniers points
        if (this.historique.length > 100) {
            this.historique.shift();
        }

        return this.prix;
    }

    // La volatilité n'est pas exposée au client (règle du jeu)
    toJSON() {
        return {
            id: this.id,
            nom: this.nom,
            prix: this.prix,
            historique: this.historique
        };
    }
}

export default Stock;
