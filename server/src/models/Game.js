import Market    from '../services/MarketEngine.js';
import GameTimer from '../services/GameTimer.js';
import { resetCompteurId } from '../models/Player.js';
class Game {
    constructor() {
        this.players  = [];
        this.started  = false;
        this.finished = false;
        this.market   = new Market();
        this.timer    = new GameTimer();

        // Callback Socket.io injecté depuis socketHandler
        this._onGameEnd = null;
    }

    // ── Injection du callback de fin (appelé par socketHandler) ──────────────
    setOnGameEnd(cb) { this._onGameEnd = cb; }

    // ── Joueurs ───────────────────────────────────────────────────────────────
    addPlayer(player) {
        if (this.started) return false;
        if (this.players.find(p => p.id === player.id)) return false;
        this.players.push(player);
        return true;
    }

    preparerNouvellePartie() {
        this.players  = [];
        this.finished = false;
        this.market   = new Market();
        resetCompteurId();
    }

    // ── Cycle de vie ──────────────────────────────────────────────────────────
    demarrer() {
        if (this.started || this.players.length < 2) return false;
        this.started  = true;
        this.finished = false;

        this.market.demarrer();

        this.timer.start(() => this.terminer());

        console.log('[GAME] Partie démarrée');
        return true;
    }

    terminer() {
        if (this.finished) return;

        this.finished = true;
        this.started  = false;

        this.timer.stop();
        this.market.arreter();

        console.log('[GAME] Partie terminée !');

        // Notifie les clients WebSocket
        this._onGameEnd?.(this.calculerClassement());
    }

    // ── Garde-fous ────────────────────────────────────────────────────────────
    _verifierPartieEnCours() {
        if (!this.started)  return "Partie non démarrée";
        if (this.finished)  return "Partie déjà terminée";
        return null;
    }
    //  Validation stricte des types
    _validerTransaction(playerId, actionId, quantite) {
        if (!Number.isInteger(playerId) || playerId <= 0)
            return "playerId invalide (entier positif attendu)";
        if (!Number.isInteger(actionId) || actionId <= 0)
            return "actionId invalide (entier positif attendu)";
        if (!Number.isInteger(quantite) || quantite <= 0)
            return "quantite invalide (entier strictement positif attendu)";
        return null;
    }

    // ── Transactions ──────────────────────────────────────────────────────────
    acheter(playerId, actionId, quantite) {
        const erreur = this._verifierPartieEnCours() || this._validerTransaction(playerId, actionId, quantite);
        if (erreur) return { success: false, message: erreur };

        const player = this.players.find(p => p.id === playerId);
        if (!player) return { success: false, message: "Joueur introuvable" };

        const action = this.market.getStock(actionId);
        if (!action) return { success: false, message: "Action introuvable" };

        if (quantite <= 0) return { success: false, message: "Quantité invalide" };

        const success = player.acheterAction(action, quantite);
        if (!success) return { success: false, message: "Solde insuffisant" };

        return {
            success: true,
            solde:        player.getSolde(),
            portefeuille: player.getPortefeuilleDetail(),
            patrimoine:   player.getPatrimoine()
        };
    }

    vendre(playerId, actionId, quantite) {
        const erreur = this._verifierPartieEnCours() || this._validerTransaction(playerId, actionId, quantite);
        if (erreur) return { success: false, message: erreur };

        const player = this.players.find(p => p.id === playerId);
        if (!player) return { success: false, message: "Joueur introuvable" };

        const action = this.market.getStock(actionId);
        if (!action) return { success: false, message: "Action introuvable" };

        if (quantite <= 0) return { success: false, message: "Quantité invalide" };

        const success = player.vendreAction(action, quantite);
        if (!success) return { success: false, message: "Actions insuffisantes" };

        return {
            success: true,
            solde:        player.getSolde(),
            portefeuille: player.getPortefeuilleDetail(),
            patrimoine:   player.getPatrimoine()
        };
    }

    // ── Lecture ───────────────────────────────────────────────────────────────
    verifierFinPartie()  { return this.finished; }
    getTempsEcoule()     { return this.timer.getTempsEcoule(); }
    getDureeRestante()   { return this.timer.getDureeRestante(); }

    calculerClassement() {
        return this.players
            .map(p => ({ id: p.id, name: p.name, solde: p.getSolde(), patrimoine: p.getPatrimoine() }))
            .sort((a, b) => b.patrimoine - a.patrimoine);
    }

    getGameState() {
    return {
        started:          this.started,
        finished:         this.finished,
        nbJoueurs:        this.players.length,
        tempsEcoule:      this._formatDuree(this.getTempsEcoule()),
        dureeRestante:    this._formatDuree(this.getDureeRestante()),
        dernierEvenement: this.market.getDernierEvenement(),
        classement:       this.finished ? this.calculerClassement() : null
    };
}

_formatDuree(ms) {
    const totalSecondes = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSecondes / 60);
    const secondes = totalSecondes % 60;
    return `${minutes}m ${secondes.toString().padStart(2, '0')}s`;
}
}

export default Game;