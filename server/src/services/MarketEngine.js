import Stock from '../models/Stock.js';

// ── Événements macro-économiques prédéfinis ──────────────────────────────────
const EVENEMENTS_POSITIFS = [
    "Résultats trimestriels excellents",
    "Nouveau contrat signé avec l'État",
    "Innovation technologique majeure",
    "Entrée sur un nouveau marché",
    "Partenariat stratégique annoncé",
    "Hausse de la demande mondiale",
    "Bénéfices record annoncés",
    "Recommandation d'achat par analyste"
];

const EVENEMENTS_NEGATIFS = [
    "Scandale financier révélé",
    "Perte d'un gros client",
    "Régulation défavorable adoptée",
    "Fuite de données massive",
    "Démission du PDG",
    "Rappel de produit massif",
    "Résultats décevants",
    "Amende record de l'autorité de marché"
];

const FAUSSES_INFOS_POSITIVES = [
    "Rumeur : fusion imminente avec un géant du secteur",
    "Rumeur : contrat secret avec une grande puissance",
    "Rumeur : nouvelle technologie révolutionnaire en préparation",
    "Rumeur : investissement massif d'un fonds souverain"
];

const FAUSSES_INFOS_NEGATIVES = [
    "Rumeur : faillite imminente",
    "Rumeur : enquête pénale en cours",
    "Rumeur : perte d'un brevet clé",
    "Rumeur : départ massif de cadres dirigeants"
];

// ── Actions prédéfinies ──────────────────────────────────────────────────────
const ACTIONS_INITIALES = [
    { id: 1, nom: 'TechNova',    prix: 120, volatilite: 'elevee'  },
    { id: 2, nom: 'BioSanté',    prix:  85, volatilite: 'moyenne' },
    { id: 3, nom: 'ÉcoVert',     prix:  60, volatilite: 'moyenne' },
    { id: 4, nom: 'FinancePlus',  prix: 200, volatilite: 'faible'  },
    { id: 5, nom: 'MédiaWorld',  prix:  45, volatilite: 'elevee'  },
];

/**
 * MarketEngine — Moteur de marché multi-actions
 *
 * Fournit l'API attendue par Game.js :
 *   demarrer(), arreter(), getAllStocks(), getStock(id),
 *   getDernierEvenement(), setDernierEvenement(), getFausseInfo()
 */
class MarketEngine {
    constructor() {
        this.stocks           = [];
        this.isRunning        = false;
        this.intervalId       = null;
        this.eventIntervalId  = null;
        this._dernierEvenement = null;
        this._io               = null;      // référence Socket.IO (optionnelle)

        // Génère les actions initiales
        for (const cfg of ACTIONS_INITIALES) {
            this.stocks.push(new Stock(cfg.id, cfg.nom, cfg.prix, cfg.volatilite));
        }
    }

    // ── Cycle de vie ─────────────────────────────────────────────────────────

    /**
     * Démarre la simulation.
     * @param {object} [io] — instance Socket.IO pour émettre les mises à jour
     */
    demarrer(io) {
        if (this.isRunning) return;
        this.isRunning = true;
        if (io) this._io = io;

        // Fluctuation toutes les 2 secondes
        this.intervalId = setInterval(() => {
            this._tick();
        }, 2000);

        // Événement macro toutes les 30 secondes
        this.eventIntervalId = setInterval(() => {
            this._genererEvenement();
        }, 30000);

        console.log('[MARKET] Marché démarré');
    }

    arreter() {
        if (!this.isRunning) return;
        this.isRunning = false;
        clearInterval(this.intervalId);
        clearInterval(this.eventIntervalId);
        this.intervalId      = null;
        this.eventIntervalId = null;
        console.log('[MARKET] Marché arrêté');
    }

    // ── Tick (fluctuation de toutes les actions) ─────────────────────────────

    _tick() {
        for (const stock of this.stocks) {
            stock.fluctuer();
        }

        // Émet la mise à jour en temps réel si Socket.IO est branché
        if (this._io) {
            this._io.emit('market:update', {
                actions:   this.getAllStocks(),
                timestamp: Date.now()
            });
        }
    }

    // ── Événements macro ─────────────────────────────────────────────────────

    _genererEvenement() {
        const positif    = Math.random() > 0.5;
        const liste      = positif ? EVENEMENTS_POSITIFS : EVENEMENTS_NEGATIFS;
        const evenement  = liste[Math.floor(Math.random() * liste.length)];
        const action     = this.stocks[Math.floor(Math.random() * this.stocks.length)];
        const impact     = positif
            ? +(Math.random() * 0.08 + 0.02).toFixed(4)   // +2% à +10%
            : -(Math.random() * 0.08 + 0.02).toFixed(4);  // -2% à -10%

        // Applique l'impact à l'action ciblée
        action.fluctuer({ impact });

        this._dernierEvenement = {
            actionId:  action.id,
            actionNom: action.nom,
            evenement,
            impact,
            timestamp: new Date().toLocaleTimeString('fr-FR')
        };

        // Émet l'événement via Socket.IO
        if (this._io) {
            this._io.emit('market:event', this._dernierEvenement);
        }

        console.log(`[MARKET] Événement : ${evenement} → ${action.nom} (${impact > 0 ? '+' : ''}${(impact * 100).toFixed(1)}%)`);
    }

    // ── Lecture ───────────────────────────────────────────────────────────────

    getAllStocks() {
        return this.stocks.map(s => s.toJSON());
    }

    getStock(id) {
        return this.stocks.find(s => s.id === id) || null;
    }

    getDernierEvenement() {
        return this._dernierEvenement;
    }

    setDernierEvenement(evt) {
        this._dernierEvenement = evt;

        // Propage aussi par socket
        if (this._io) {
            this._io.emit('market:event', evt);
        }
    }

    getFausseInfo(positif) {
        const liste = positif ? FAUSSES_INFOS_POSITIVES : FAUSSES_INFOS_NEGATIVES;
        return liste[Math.floor(Math.random() * liste.length)];
    }
}

export default MarketEngine;