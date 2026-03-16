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

const EVENEMENTS_POSITIFS = [
    "Bonne nouvelle économique",
    "Lancement produit réussi",
    "Rachat d'entreprise",
    "Rapport trimestriel positif"
];

const EVENEMENTS_NEGATIFS = [
    "Scandale financier",
    "Grève générale",
    "Faillite fournisseur",
    "Cyberattaque détectée"
];

class EventEngine {
    constructor(actions) {
        this.actions              = actions;
        this.dernierEvenement     = null;
        this._intervalEvenement   = null;
        this._onEvenement         = null; // ✅ callback Socket.io
    }

    demarrer() {
        this._intervalEvenement = setInterval(() => {
            this._declencherEvenementAleatoire();
        }, 120000);
    }

    arreter() {
        clearInterval(this._intervalEvenement);
        this._intervalEvenement = null;
    }

    setOnEvenement(cb) { this._onEvenement = cb; } // ✅

    _declencherEvenementAleatoire() {
        const ev     = EVENEMENTS_MARCHE[Math.floor(Math.random() * EVENEMENTS_MARCHE.length)];
        const action = this.actions[Math.floor(Math.random() * this.actions.length)];

        action.fluctuer(ev);

        this.dernierEvenement = {
            actionId:  action.id,
            actionNom: action.nom,
            evenement: ev.nom,
            impact:    ev.impact,
            timestamp: new Date().toLocaleTimeString('fr-FR')
        };

        this._onEvenement?.(this.dernierEvenement); // ✅ notifie Socket.io immédiatement

        console.log(`[MARCHÉ] "${ev.nom}" affecte ${action.nom} (impact: ${ev.impact > 0 ? '+' : ''}${(ev.impact * 100).toFixed(0)}%)`);
    }

    // ✅ Permet d'enregistrer une rumeur comme un vrai événement de marché
    setDernierEvenement(evenement) {
        this.dernierEvenement = evenement;
        this._onEvenement?.(evenement);
        console.log(`[MARCHÉ] "${evenement.evenement}" affecte ${evenement.actionNom} (impact: ${evenement.impact > 0 ? '+' : ''}${(evenement.impact * 100).toFixed(0)}%)`); // ✅
    }

    getDernierEvenement() { return this.dernierEvenement; }

    // ✅ Retourne un nom d'événement crédible pour masquer une rumeur
    getFausseInfo(positif) {
        const liste = positif ? EVENEMENTS_POSITIFS : EVENEMENTS_NEGATIFS;
        return liste[Math.floor(Math.random() * liste.length)];
    }
}

export default EventEngine;