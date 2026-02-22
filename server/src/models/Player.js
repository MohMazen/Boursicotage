let compteurId = 1001;
class Player {
    constructor(name, id) {
        this.id    = compteurId++;
        this.name  = name;
        this.solde = 10000;

        // Structure : { actionId: { action: obj, quantite: number } }
        this.portefeuille = {};
    }

    // ─── Gestion du solde ────────────────────────────────────────────────────

    crediterCompte(montant) {
        this.solde += montant;
    }

    debiterCompte(montant) {
        if (this.solde < montant) return false;
        this.solde -= montant;
        return true;
    }

    getSolde() {
        return this.solde;
    }

    // Transactions

    acheterAction(action, quantite) {
        const coutTotal = parseFloat((action.prix * quantite).toFixed(2));

        if (!this.debiterCompte(coutTotal)) return false;

        if (!this.portefeuille[action.id]) {
            this.portefeuille[action.id] = { action, quantite: 0 };
        }

        this.portefeuille[action.id].quantite += quantite;
        return true;
    }

    vendreAction(action, quantite) {
        const ligne = this.portefeuille[action.id];

        if (!ligne || ligne.quantite < quantite) return false;

        const gainTotal = parseFloat((action.prix * quantite).toFixed(2));
        this.crediterCompte(gainTotal);

        ligne.quantite -= quantite;

        if (ligne.quantite === 0) {
            delete this.portefeuille[action.id];
        }

        return true;
    }

    
    getPatrimoine() {
        let patrimoine = this.solde;

        for (const id in this.portefeuille) {
            const ligne = this.portefeuille[id];
            patrimoine += ligne.quantite * ligne.action.prix;
        }

        return parseFloat(patrimoine.toFixed(2));
    }

    // Retourne le portefeuille avec les valeurs actualisées
    getPortefeuilleDetail() {
        const detail = {};

        for (const id in this.portefeuille) {
            const ligne = this.portefeuille[id];
            detail[id] = {
                nom:          ligne.action.nom,
                quantite:     ligne.quantite,
                prixActuel:   ligne.action.prix,
                valeurTotale: parseFloat((ligne.quantite * ligne.action.prix).toFixed(2))
            };
        }

        return detail;
    }
}

export default Player;
