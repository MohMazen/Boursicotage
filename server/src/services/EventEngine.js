// Événements de marché simulés pouvant affecter aléatoirement une action
const EVENEMENTS_MARCHE = [
    { nom: "Bonne nouvelle économique",   impact:  0.05 },
    { nom: "Scandale financier",          impact: -0.08 },
    { nom: "Lancement produit réussi",    impact:  0.06 },
    { nom: "Grève générale",              impact: -0.04 },
    { nom: "Rachat d'entreprise",         impact:  0.10 },
    { nom: "Faillite fournisseur",        impact: -0.06 },
    { nom: "Rapport trimestriel positif", impact:  0.04 },
    { nom: "Cyberattaque détectée",       impact: -0.07 },
];

class EventEngine {
    constructor(actions) {
        this.actions         = actions;
        this.dernierEvenement = null;
        this._intervalEvenement = null;
    }

    // ─── Cycle de vie ────────────────────────────────────────────────────────

    demarrer() {
        this._intervalEvenement = setInterval(() => {
            this._declencherEvenementAleatoire();
        }, 30000);
    }

    arreter() {
        clearInterval(this._intervalEvenement);
        this._intervalEvenement = null;
    }

    // ─── Événements ──────────────────────────────────────────────────────────

    _declencherEvenementAleatoire() {
        const ev     = EVENEMENTS_MARCHE[Math.floor(Math.random() * EVENEMENTS_MARCHE.length)];
        const action = this.actions[Math.floor(Math.random() * this.actions.length)];

        action.fluctuer(ev);

        this.dernierEvenement = {
            actionId:  action.id,
            actionNom: action.nom,
            evenement: ev.nom,
            impact:    ev.impact,
            timestamp: Date.now()
        };

        console.log(`[MARCHÉ] "${ev.nom}" affecte ${action.nom} (impact: ${ev.impact > 0 ? '+' : ''}${(ev.impact * 100).toFixed(0)}%)`);
    }

    // ─── Accesseurs ──────────────────────────────────────────────────────────

    getDernierEvenement() {
        return this.dernierEvenement;
    }
}

export default EventEngine;