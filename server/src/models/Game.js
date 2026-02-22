import Market from '..services/MarketEngine.js';

class Game {
    constructor() {
        this.players  = [];
        this.started  = false;
        this.finished = false;

        this.startTime = null;
        this.endTime   = null;
        this.duration  = null;
        this.timer     = null;

        this.market = new Market();
    }

    // ─── Gestion des joueurs ─────────────────────────────────────────────────

    addPlayer(player) {
        if (this.started)  return false; // impossible une fois démarrée
        if (this.players.find(p => p.id === player.id)) return false; // pas de doublon
        this.players.push(player);
        return true;
    }

    // ─── Cycle de vie ────────────────────────────────────────────────────────

    demarrer() {
        if (this.started)              return false;
        if (this.players.length < 2)   return false;

        this.started  = true;
        this.finished = false;
        this.startTime = Date.now();

        // Durée aléatoire entre 5 et 15 minutes, inconnue des joueurs
        const minMinutes = 5;
        const maxMinutes = 15;
        const randomMinutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;

        this.duration = randomMinutes * 60 * 1000;
        this.endTime  = this.startTime + this.duration;

        // Démarre les fluctuations du marché
        this.market.demarrer();

        // Fin automatique après la durée aléatoire
        this.timer = setTimeout(() => {
            this.terminer();
        }, this.duration);

        console.log(`[GAME] Partie démarrée — durée secrète : ${randomMinutes} min`);
        return true;
    }

    terminer() {
        if (this.finished) return;

        this.finished = true;
        this.started  = false;

        if (this.timer) clearTimeout(this.timer);

        // Arrête les fluctuations du marché
        this.market.arreter();

        console.log('[GAME] Partie terminée !');
    }

    // ─── Garde-fous communs ──────────────────────────────────────────────────

    _verifierPartieEnCours() {
        if (!this.started)  return "Partie non démarrée";
        if (this.finished)  return "Partie déjà terminée";
        return null;
    }

    // ─── Transactions (centralisées ici pour valider l'état de la partie) ───

    acheter(playerId, actionId, quantite) {
        const erreur = this._verifierPartieEnCours();
        if (erreur) return { success: false, message: erreur };

        const player = this.players.find(p => p.id === playerId);
        if (!player) return { success: false, message: "Joueur introuvable" };

        const action = this.market.getAction(actionId);
        if (!action) return { success: false, message: "Action introuvable" };

        if (quantite <= 0) return { success: false, message: "Quantité invalide" };

        const success = player.acheterAction(action, quantite);
        if (!success) return { success: false, message: "Solde insuffisant" };

        return {
            success: true,
            solde:         player.getSolde(),
            portefeuille:  player.getPortefeuilleDetail(),
            patrimoine:    player.getPatrimoine()
        };
    }

    vendre(playerId, actionId, quantite) {
        const erreur = this._verifierPartieEnCours();
        if (erreur) return { success: false, message: erreur };

        const player = this.players.find(p => p.id === playerId);
        if (!player) return { success: false, message: "Joueur introuvable" };

        const action = this.market.getAction(actionId);
        if (!action) return { success: false, message: "Action introuvable" };

        if (quantite <= 0) return { success: false, message: "Quantité invalide" };

        const success = player.vendreAction(action, quantite);
        if (!success) return { success: false, message: "Actions insuffisantes en portefeuille" };

        return {
            success: true,
            solde:        player.getSolde(),
            portefeuille: player.getPortefeuilleDetail(),
            patrimoine:   player.getPatrimoine()
        };
    }

    //Lecture 

    verifierFinPartie() {
        return this.finished;
    }

    getTempsEcoule() {
        if (!this.startTime) return 0;
        return Date.now() - this.startTime;
    }

    getDureeRestante() {
        if (this.finished || !this.endTime) return 0;
        return Math.max(0, this.endTime - Date.now());
    }

    calculerClassement() {
        return this.players
            .map(p => ({
                id:         p.id,
                name:       p.name,
                solde:      p.getSolde(),
                patrimoine: p.getPatrimoine()
            }))
            .sort((a, b) => b.patrimoine - a.patrimoine);
    }

    getGameState() {
        return {
            started:         this.started,
            finished:        this.finished,
            nbJoueurs:       this.players.length,
            tempsEcoule:     this.getTempsEcoule(),
            dureeRestante:   this.getDureeRestante(),
            dernierEvenement: this.market.getDernierEvenement(),
            classement:      this.finished ? this.calculerClassement() : null
        };
    }
}

export default Game;
