class Player {
    constructor(name, id) {
        this.id = id;
        this.name = name;
        this.solde = 10000;

        // { actionId: { action: obj, quantite: number } }
        this.portefeuille = {};
    }
    crediterCompte(montant) {
        this.solde += montant;
    }

    debiterCompte(montant) {
        if (this.solde < montant) return false;
        this.solde -= montant;
        return true;
    }

    acheterAction(action, quantite) {
       const coutTotal = action.prix * quantite;

       if (!this.debiterCompte(coutTotal)) {
        return false; // pas assez d'argent
      } 

        if (!this.portefeuille[action.id]) {
            this.portefeuille[action.id] = {
                action,
                quantite: 0
            };
        }

        this.portefeuille[action.id].quantite += quantite;
        return true;
    }

    vendreAction(action, quantite) {
        const ligne = this.portefeuille[action.id];

        if (!ligne || ligne.quantite < quantite) return false;

        const gainTotal = action.prix * quantite;
         this.crediterCompte(gainTotal); ;

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

        return patrimoine;
    }

    peutAcheter(action, quantite) {
        return this.solde >= action.prix * quantite;
    }

    

    getSolde() {
        return this.solde;
    }
}

export default Player;
