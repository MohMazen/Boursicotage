let compteurId = 1001;
export const resetCompteurId = () => { compteurId = 1001; };
class Player {
    constructor(name, id) {
        this.id    = compteurId++;
        this.name  = name;
        this.solde = 10000;

        // Structure : { actionId: { action: obj, quantite: number } }
        this.portefeuille = {};
        this.historique = []; // Pour stocker les transactions passées
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

    getSolde() { return parseFloat(this.solde.toFixed(2)); }

    // Transactions

    acheterAction(action, quantite) {
        const coutTotal = parseFloat((action.prix * quantite).toFixed(2));
        if (!this.debiterCompte(coutTotal)) return false;

        if (!this.portefeuille[action.id])
            this.portefeuille[action.id] = { action, quantite: 0, prixMoyenAchat: 0 };

        const ligne = this.portefeuille[action.id];
        // Moyenne pondérée du prix d'achat
        const ancienTotal = ligne.quantite * ligne.prixMoyenAchat;
        ligne.quantite += quantite;
        ligne.prixMoyenAchat = parseFloat(((ancienTotal + coutTotal) / ligne.quantite).toFixed(2));

        this.historique.push({
            type: 'achat', actionId: action.id, actionNom: action.nom,
            quantite, prixUnitaire: action.prix, total: coutTotal,
            timestamp: Date.now()
        });
        return true;
    }

    vendreAction(action, quantite) {
        const ligne = this.portefeuille[action.id];
        if (!ligne || ligne.quantite < quantite) return false;

        const gainTotal = parseFloat((action.prix * quantite).toFixed(2));
        const plusValue = parseFloat(((action.prix - ligne.prixMoyenAchat) * quantite).toFixed(2)); // positif = bénéfice, négatif = perte
        this.crediterCompte(gainTotal);

        ligne.quantite -= quantite;
        if (ligne.quantite === 0) delete this.portefeuille[action.id];

        this.historique.push({
            type: 'vente', actionId: action.id, actionNom: action.nom,
            quantite, prixUnitaire: action.prix, total: gainTotal,
            plusValue, //  positif = bénéfice, négatif = perte
            timestamp: Date.now()
        });
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
                nom:             ligne.action.nom,
                quantite:        ligne.quantite,
                prixActuel:      ligne.action.prix,
                prixMoyenAchat:  ligne.prixMoyenAchat,  // prix moyen d'achat pour calculer les plus-values latentes
                valeurTotale:    parseFloat((ligne.quantite * ligne.action.prix).toFixed(2)),
                plusValueLatente: parseFloat(((ligne.action.prix - ligne.prixMoyenAchat) * ligne.quantite).toFixed(2)) //  positif = plus-value latente, négatif = moins-value latente
            };
        }
        return detail;
    }
    getHistorique() { return this.historique; }
}

export default Player;
