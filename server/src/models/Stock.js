/**
 * Stock — Modèle d'une action boursière (Version GBM)
 * 
 * Implémente le Mouvement Brownien Géométrique pour des courbes réalistes.
 * Inclut un système de "warmup" pour simuler un historique au démarrage.
 */

function gaussianRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

class Stock {
    constructor(id, nom, prixInitial, secteur, mu, sigma) {
        this.id           = id;
        this.nom          = nom;
        this.prix         = prixInitial;
        this.prixInitial  = prixInitial;
        this.secteur      = secteur;

        // ── Paramètres Secrets ───────────────────────────────────────────────
        this._mu          = mu;        // Drift (tendance long terme)
        this._sigma       = sigma;     // Volatilité de base
        
        // Calibrage : simule 6h de trading (21600s) avec des ticks de 2s
        // Le facteur 8 permet de rendre les variations "jouables" visuellement
        this._dt          = (2 / 21600) * 8; 

        // Modificateurs dynamiques (Régimes de marché / Événements)
        this._sigmaMultiplier = 1.0;
        this._eventImpact     = 0;
        this._rumeurImpact    = null;

        // ── Historique & Warmup ──────────────────────────────────────────────
        this.historique = []; 
        
        // Pré-chauffe silencieuse : simule 60 ticks (~2min) pour remplir le graphique
        this._warmup(60);
    }

    /**
     * Simule N ticks sans émettre d'événements pour remplir l'historique initial
     */
    _warmup(ticks) {
        for (let i = 0; i < ticks; i++) {
            this.fluctuer();
        }
    }

    setSigmaMultiplier(multiplier) {
        this._sigmaMultiplier = multiplier;
    }

    addEventImpact(impact) {
        this._eventImpact += impact;
    }

    /**
     * Fait évoluer le prix selon la formule GBM : dS = S * (μ * dt + σ * dW)
     */
    fluctuer() {
        const S     = this.prix;
        const mu    = this._mu;
        const sigma = this._sigma * this._sigmaMultiplier;
        const dt    = this._dt;
        const dW    = gaussianRandom() * Math.sqrt(dt);

        // Calcul de la variation relative
        let deltaPct = (mu * dt) + (sigma * dW);

        // Ajout de l'impact des événements (décroissance gérée par le tick)
        if (this._eventImpact !== 0) {
            deltaPct += (this._eventImpact * dt * 10); // Amplify for visibility
            this._eventImpact *= 0.85; // Decay
            if (Math.abs(this._eventImpact) < 0.0001) this._eventImpact = 0;
        }

        if (this._rumeurImpact) {
            deltaPct += (this._rumeurImpact * dt * 8);
        }

        let dS = S * deltaPct;

        // Mise à jour du prix (minimum 1€)
        this.prix = Math.max(1, parseFloat((S + dS).toFixed(2)));

        // Ajout à l'historique circulaire (max 60 points pour le client)
        this.historique.push({ 
            prix: this.prix, 
            timestamp: Date.now() 
        });

        if (this.historique.length > 60) {
            this.historique.shift();
        }

        return this.prix;
    }

    toJSON() {
        return {
            id:         this.id,
            nom:        this.nom,
            prix:       this.prix,
            secteur:    this.secteur,
            historique: this.historique 
        };
    }
}

export default Stock;