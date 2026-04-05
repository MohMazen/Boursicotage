import Stock from '../models/Stock.js';

// ── Actions demandées avec paramètres GBM ─────────────────────────────────────
const ACTIONS_INITIALES = [
    { id: 1, nom: 'TechNova',   prix: 150, secteur: 'Tech',           mu: +0.015, sigma: 0.035 },
    { id: 2, nom: 'EnerGreen',  prix:  80, secteur: 'Énergie verte',  mu: +0.005, sigma: 0.025 },
    { id: 3, nom: 'CryptoX',    prix: 200, secteur: 'Crypto fictif',  mu: -0.005, sigma: 0.080 },
    { id: 4, nom: 'MediCorp',   prix: 120, secteur: 'Pharma',         mu: +0.010, sigma: 0.020 },
    { id: 5, nom: 'AgroFund',   prix:  60, secteur: 'Agriculture',    mu:  0.000, sigma: 0.015 },
];

// ── Événements macro-économiques (intensité variable) ─────────────────────────
const EVENEMENTS = {
    positif_fort: [
        "Percée technologique révolutionnaire !",
        "Contrat historique signé avec un État majeur",
        "Fusion approuvée par les régulateurs",
        "Bénéfices record annoncés !"
    ],
    positif_leger: [
        "Nouveau partenariat stratégique",
        "Résultats trimestriels encourageants",
        "Hausse de la demande sur le secteur",
        "Analyste réputé recommande l'achat"
    ],
    negatif_leger: [
        "Légère baisse des prévisions",
        "Pression réglementaire accrue",
        "Démission d'un cadre dirigeant",
        "Perte d'un contrat mineur"
    ],
    negatif_fort: [
        "Scandale financier révélé !",
        "Sanction massive de l'autorité de marché",
        "Rappel de produit massif — coût astronomique",
        "Incident technique majeur sur les serveurs"
    ],
    neutre_perturbateur: [
        "Rumeurs contradictoires sur le marché",
        "Annonce surprise du PDG — impact incertain",
        "Spéculations intenses — les investisseurs divisés",
        "Ajustement réglementaire global"
    ],
};

// ── Événements sectoriels (affectent plusieurs actions) ──────────────────────
const EVENEMENTS_SECTORIELS = [
    { secteurs: ['Tech', 'Crypto fictif'],  label: "Boom numérique mondial",      impact: +0.05 },
    { secteurs: ['Tech', 'Crypto fictif'],  label: "Régulation Tech sévère",      impact: -0.05 },
    { secteurs: ['Énergie verte', 'Pharma'], label: "Plan de relance écologique",  impact: +0.04 },
    { secteurs: ['Agriculture', 'Énergie verte'], label: "Sécheresse mondiale",     impact: -0.06 },
    { secteurs: ['Pharma'],                  label: "Crise sanitaire mondiale",    impact: +0.08 }
];

// ── Régimes de marché ────────────────────────────────────────────────────────
const REGIMES = {
    calme:  { label: 'Marché calme',  sigmaMultiplier: 0.5 },
    normal: { label: 'Marché normal', sigmaMultiplier: 1.0 },
    agite:  { label: 'Marché agité',  sigmaMultiplier: 1.8 },
};

class MarketEngine {
    constructor() {
        this.stocks            = [];
        this.isRunning         = false;
        this.intervalId        = null;
        this.eventIntervalId   = null;
        this.regimeIntervalId  = null;
        this._dernierEvenement = null;
        this._io               = null;
        this._regime           = 'normal';

        // Initialisation des actions avec warmup
        for (const cfg of ACTIONS_INITIALES) {
            this.stocks.push(new Stock(cfg.id, cfg.nom, cfg.prix, cfg.secteur, cfg.mu, cfg.sigma));
        }
    }

    demarrer(io) {
        if (this.isRunning) return;
        this.isRunning = true;
        this._io = io || this._io;

        // Tick GBM toutes les 2 secondes (calibré dans Stock.js)
        this.intervalId = setInterval(() => {
            this._tick();
        }, 2000);

        // Événement toutes les 30 secondes
        this.eventIntervalId = setInterval(() => {
            this._genererEvenement();
        }, 30000);

        // Changement de régime de marché (1 à 3 min)
        this._planifierChangementRegime();

        console.log('[MARKET] Moteur de marché démarré (Régime Normal)');
    }

    arreter() {
        if (!this.isRunning) return;
        this.isRunning = false;
        clearInterval(this.intervalId);
        clearInterval(this.eventIntervalId);
        clearTimeout(this.regimeIntervalId);
        this.intervalId       = null;
        this.eventIntervalId  = null;
        this.regimeIntervalId = null;
    }

    _tick() {
        for (const stock of this.stocks) {
            stock.fluctuer();
        }
        if (this._io) {
            this._io.emit('market:update', {
                actions:   this.getAllStocks(),
                timestamp: Date.now()
            });
        }
    }

    _planifierChangementRegime() {
        const delai = 60000 + Math.random() * 120000;
        this.regimeIntervalId = setTimeout(() => {
            if (!this.isRunning) return;
            this._selectionnerRegime();
            this._planifierChangementRegime();
        }, delai);
    }

    _selectionnerRegime() {
        const cles = Object.keys(REGIMES);
        let nouveau;
        do { nouveau = cles[Math.floor(Math.random() * cles.length)]; } 
        while (nouveau === this._regime);

        this._regime = nouveau;
        const conf = REGIMES[nouveau];

        for (const stock of this.stocks) {
            stock.setSigmaMultiplier(conf.sigmaMultiplier);
        }

        if (this._io) {
            this._io.emit('market:regime', { regime: nouveau, label: conf.label });
        }
        console.log(`[MARKET] Nouveau régime : ${conf.label}`);
    }

    _genererEvenement() {
        // 20% de chance d'événement sectoriel
        if (Math.random() < 0.20) {
            this._evenementSectoriel();
            return;
        }

        const rand = Math.random();
        let type, impact;
        if (rand < 0.1) { type = 'positif_fort'; impact = 0.08; }
        else if (rand < 0.4) { type = 'positif_leger'; impact = 0.03; }
        else if (rand < 0.6) { type = 'neutre_perturbateur'; impact = 0.01; }
        else if (rand < 0.9) { type = 'negatif_leger'; impact = -0.03; }
        else { type = 'negatif_fort'; impact = -0.08; }

        const options = EVENEMENTS[type];
        const label = options[Math.floor(Math.random() * options.length)];
        const target = this.stocks[Math.floor(Math.random() * this.stocks.length)];

        if (type === 'neutre_perturbateur') {
            // Pas de direction, mais boost temporaire de sigma (volatilité)
            const oldConf = REGIMES[this._regime].sigmaMultiplier;
            target.setSigmaMultiplier(oldConf * 2.5);
            setTimeout(() => target.setSigmaMultiplier(oldConf), 12000);
        } else {
            target.addEventImpact(impact);
        }

        this._dernierEvenement = {
            actionId: target.id,
            actionNom: target.nom,
            evenement: label,
            type,
            impact,
            timestamp: new Date().toLocaleTimeString('fr-FR')
        };

        if (this._io) this._io.emit('market:event', this._dernierEvenement);
        console.log(`[MARKET] Événement ${type} sur ${target.nom} : ${label}`);
    }

    _evenementSectoriel() {
        const evt = EVENEMENTS_SECTORIELS[Math.floor(Math.random() * EVENEMENTS_SECTORIELS.length)];
        const cibles = this.stocks.filter(s => evt.secteurs.includes(s.secteur));

        if (cibles.length === 0) return;

        for (const s of cibles) {
            s.addEventImpact(evt.impact);
        }

        this._dernierEvenement = {
            actionNom: cibles.map(c => c.nom).join(', '),
            evenement: evt.label,
            type: 'sectoriel',
            impact: evt.impact,
            timestamp: new Date().toLocaleTimeString('fr-FR')
        };

        if (this._io) this._io.emit('market:event', this._dernierEvenement);
        console.log(`[MARKET] Événement SECORIEL : ${evt.label} sur ${this._dernierEvenement.actionNom}`);
    }

    getAllStocks() { return this.stocks.map(s => s.toJSON()); }
    getStocksHistory() {
        const history = {};
        for (const s of this.stocks) { history[s.id] = s.historique; }
        return history;
    }
    getDernierEvenement() { return this._dernierEvenement; }
    getRegime() { return { regime: this._regime, label: REGIMES[this._regime].label }; }

    // ── NÉCESSAIRES POUR GAME.JS ─────────────────────────────────────────────
    getStock(id) {
        return this.stocks.find(s => s.id === id);
    }

    setDernierEvenement(evt) {
        this._dernierEvenement = evt;
        if (this._io) this._io.emit('market:event', evt);
    }

    getFausseInfo(positif) {
        const fakePositif = [
            "Rumeurs de rachat imminent par un géant du secteur",
            "Nouveau brevet déposé en secret — énorme potentiel",
            "Le PDG achète massivement ses propres actions",
            "Signaux d'achat détectés par les algorithmes"
        ];
        const fakeNegatif = [
            "Enquête de fraude fiscale en cours ?",
            "Rumeurs de démission massive au conseil d'administration",
            "Faille de sécurité majeure détectée",
            "Ventes massives signalées sur le dark web"
        ];
        const list = positif ? fakePositif : fakeNegatif;
        return list[Math.floor(Math.random() * list.length)];
    }
}

export default MarketEngine;