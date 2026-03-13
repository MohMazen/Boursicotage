import MarketEngine from '../services/MarketEngine.js';
import GameTimer from '../services/GameTimer.js';
import { resetCompteurId } from '../models/Player.js';
class Game {
    constructor() {
        this.players  = [];
        this.started  = false;
        this.finished = false;
        this.market   = new MarketEngine();
        this.timer    = new GameTimer();
        this._derniereRumeur = {};

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
        this.market   = new MarketEngine();
        this._derniereRumeur = {};
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
        //  Vérification du gel
        if (player.estGele) return { success: false, message: "Tu es gelé — impossible d'acheter pendant 45 secondes" };

        const action = this.market.getStock(actionId);
        if (!action) return { success: false, message: "Action introuvable" };

        if (quantite <= 0) return { success: false, message: "Quantité invalide" };

        const success = player.acheterAction(action, quantite);
        if (!success) return { success: false, message: "Solde insuffisant" };
        //  Effet volume — l'achat fait légèrement monter le prix
        action.prix = parseFloat((action.prix * (1 + 0.001 * quantite)).toFixed(2));

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
         // Vérification du gel
        if (player.estGele) return { success: false, message: "Tu es gelé — impossible de vendre pendant 45 secondes" };

        const action = this.market.getStock(actionId);
        if (!action) return { success: false, message: "Action introuvable" };

        if (quantite <= 0) return { success: false, message: "Quantité invalide" };

        const success = player.vendreAction(action, quantite);
        if (!success) return { success: false, message: "Actions insuffisantes" };
        // ✅ Effet volume — la vente fait légèrement baisser le prix
        action.prix = parseFloat((action.prix * (1 - 0.001 * quantite)).toFixed(2));

        return {
            success: true,
            solde:        player.getSolde(),
            portefeuille: player.getPortefeuilleDetail(),
            patrimoine:   player.getPatrimoine()
        };
    }
    // Gel de compte
    gelerJoueur(playerId, cibleId) {
        const erreur = this._verifierPartieEnCours();
        if (erreur) return { success: false, message: erreur };

        if (!Number.isInteger(playerId) || playerId <= 0)
            return { success: false, message: "playerId invalide" };
        if (!Number.isInteger(cibleId) || cibleId <= 0)
            return { success: false, message: "cibleId invalide" };
        if (playerId === cibleId)
            return { success: false, message: "Tu ne peux pas te geler toi-même" };

        const player = this.players.find(p => p.id === playerId);
        if (!player) return { success: false, message: "Joueur introuvable" };

        // Un joueur gelé ne peut pas utiliser d'actions spéciales
        if (player.estGele) return { success: false, message: "Tu es gelé — impossible d'utiliser une action spéciale" };

        const cible = this.players.find(p => p.id === cibleId);
        if (!cible) return { success: false, message: "Joueur cible introuvable" };

        if (player.gelsRestants <= 0)
            return { success: false, message: "Tu as épuisé tes gels pour cette partie" };

        if (player.getSolde() < 1000)
            return { success: false, message: "Solde insuffisant" };

        if (cible.estGele)
            return { success: false, message: "Ce joueur est déjà gelé" };

        // Débit + décrément
        player.debiterCompte(1000);
        player.gelsRestants--;

        // Gel de la cible
        cible.estGele = true;
        setTimeout(() => {
            cible.estGele = false;
            console.log(`[GAME] Joueur ${cible.name} dégel automatique`);
        }, 45000);

        console.log(`[GAME] ${player.name} a gelé ${cible.name} pendant 45s`);

        return {
            success: true,
            message: `${cible.name} est gelé pendant 45 secondes`,
            solde: player.getSolde(),
            gelsRestants: player.gelsRestants
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

repandreRumeur(playerId, actionId, positif) {
    const erreur = this._verifierPartieEnCours();
    if (erreur) return { success: false, message: erreur };

    if (!Number.isInteger(playerId) || playerId <= 0)
        return { success: false, message: "playerId invalide" };
    if (!Number.isInteger(actionId) || actionId <= 0)
        return { success: false, message: "actionId invalide" };
    if (typeof positif !== 'boolean')
        return { success: false, message: "positif doit être un booléen (true/false)" };

    const player = this.players.find(p => p.id === playerId);
    if (!player) return { success: false, message: "Joueur introuvable" };
    //  Un joueur gelé ne peut pas utiliser d'actions spéciales
    if (player.estGele) return { success: false, message: "Tu es gelé — impossible d'utiliser une action spéciale" };
    // Vérification limite d'utilisation
    if (player.rumeursRestantes <= 0)
        return { success: false, message: "Tu as épuisé tes rumeurs pour cette partie" };

    // Vérification du solde
    if (player.getSolde() < 500)
        return { success: false, message: "Solde insuffisant — la rumeur coûte 500 crédits" };
    // Vérification cooldown
    const COOLDOWN = 60000; // 1 minute
    const tempsRestant = COOLDOWN - (Date.now() - (this._derniereRumeur[playerId] || 0));
    if (tempsRestant > 0)
        return { success: false, message: `Cooldown actif — attends encore ${Math.ceil(tempsRestant / 1000)}s` };
    const action = this.market.getStock(actionId);
    if (!action) return { success: false, message: "Action introuvable" };

    // Débit + décrément du compteur
    player.debiterCompte(500);
    player.rumeursRestantes--;

    // Impact immédiat
    const impact = positif ? 0.08 : -0.08;
    action._rumeurImpact = positif ? 0.01 : -0.01; // Impact visible dans le détail de l'action

    setTimeout(() => {
        action._rumeurImpact = positif ? -0.03 : 0.03; // correction inverse
        setTimeout(() => {
            action._rumeurImpact = null;
        }, 9000);
    }, 45000);
    const fausseInfo = this.market.getFausseInfo(positif);
    this.market.setDernierEvenement({
        actionId:  action.id,
        actionNom: action.nom,
        evenement: fausseInfo,
        impact,
        timestamp: new Date().toLocaleTimeString('fr-FR')
    });

    this._derniereRumeur[playerId] = Date.now();

    return {
        success: true,
        message: `Rumeur ${positif ? 'positive' : 'négative'} répandue sur ${action.nom}`,
        solde: player.getSolde(),
        rumeursRestantes: player.rumeursRestantes
    };
}
}

export default Game;