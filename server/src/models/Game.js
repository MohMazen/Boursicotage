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

        // ── Statistiques de fin de partie ────────────────────────────────────
        this._stats = null;

        // ── Actions spéciales : insider + short ─────────────────────────────
        this._insiderUsages  = {};  // { playerId: count }
        this._shortPositions = {};  // { playerId: { actionId: { quantite, prixEntree } } }

        // Callbacks Socket.io injectés depuis server.js
        this._onGameEnd   = null;
        this._onGameStart = null;
    }

    // ── Injection des callbacks (appelés par server.js) ──────────────────────
    setOnGameEnd(cb)   { this._onGameEnd   = cb; }
    setOnGameStart(cb) { this._onGameStart = cb; }

    // ── Joueurs ───────────────────────────────────────────────────────────────
    addPlayer(player) {
        if (this.started) return false;
        if (this.players.find(p => p.id === player.id)) return false;
        this.players.push(player);
        return true;
    }

    removePlayer(playerId) {
        this.players = this.players.filter(p => p.id !== playerId);
        delete this._shortPositions[playerId];

        // ── CORRECTION : n'émettre game:end que si la partie était en cours ──
        if (this.players.length === 0 && this.started) {
            this.terminer();
        } else if (this.players.length === 0 && this.finished) {
            this.preparerNouvellePartie();
        }
        // Si on est dans le lobby (pas started, pas finished) → rien de plus
    }

    getPlayers() {
        return this.players.map(p => ({
            id:    p.id,
            name:  p.name,
            ready: p.ready || false
        }));
    }

    setPlayerReady(playerId, ready = true) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return false;
        player.ready = ready;
        return true;
    }

    getReadyCount() {
        return this.players.filter(p => p.ready).length;
    }

    preparerNouvellePartie() {
        // ── Conserver io et les callbacks pour ne pas les perdre ─────────────
        const currentIO       = this.market._io;
        const onGameEnd       = this._onGameEnd;
        const onGameStart     = this._onGameStart;

        this.players         = [];
        this.finished        = false;
        this.started         = false;
        this.market          = new MarketEngine();
        this.market._io      = currentIO;
        this.timer           = new GameTimer();
        this._derniereRumeur = {};
        this._stats          = null;
        this._insiderUsages  = {};
        this._shortPositions = {};

        // ── CORRECTION : réinjecter les callbacks après le reset ─────────────
        this._onGameEnd   = onGameEnd;
        this._onGameStart = onGameStart;

        resetCompteurId();

        console.log('[GAME] Nouvelle partie préparée');
    }

    demarrer() {
        if (this.started)          return { success: false, message: "La partie est déjà en cours" };
        if (this.players.length < 2) return { success: false, message: "Il faut au moins 2 joueurs inscrits pour démarrer" };

        this.started  = true;
        this.finished = false;

        // Injecter Socket.IO dans le timer pour les événements de tension
        if (this.market._io) {
            this.timer.setIO(this.market._io);
        }

        this.market.demarrer();
        this.timer.start(() => this.terminer());

        console.log('[GAME] Partie démarrée');

        // Notifier le serveur (qui notifiera les sockets)
        this._onGameStart?.();

        return { success: true };
    }

    terminer() {
        if (this.finished) return;

        this.finished = true;
        this.started  = false;

        this.timer.stop();
        this.market.arreter();

        // Liquider toutes les positions short au prix de clôture
        this._liquiderShorts();

        // Calculer les statistiques finales
        this._stats = this._calculerStats();

        console.log('[GAME] Partie terminée !');

        // Notifie les clients WebSocket
        this._onGameEnd?.({
            classement:  this.calculerClassement(),
            stats:       this._stats,
            dureePartie: this.timer.getDureeTotale()
        });
    }

    // ── Garde-fous ────────────────────────────────────────────────────────────
    _verifierPartieEnCours() {
        if (!this.started)  return "Partie non démarrée";
        if (this.finished)  return "Partie déjà terminée";
        return null;
    }

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
        if (player.estGele) return { success: false, message: "Tu es gelé — impossible d'acheter pendant 30 secondes" };

        const action = this.market.getStock(actionId);
        if (!action) return { success: false, message: "Action introuvable" };

        const success = player.acheterAction(action, quantite);
        if (!success) return { success: false, message: "Solde insuffisant" };

        // Effet volume — l'achat fait légèrement monter le prix
        action.prix = parseFloat((action.prix * (1 + 0.001 * quantite)).toFixed(2));

        return {
            success:      true,
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
        if (player.estGele) return { success: false, message: "Tu es gelé — impossible de vendre pendant 30 secondes" };

        const action = this.market.getStock(actionId);
        if (!action) return { success: false, message: "Action introuvable" };

        const success = player.vendreAction(action, quantite);
        if (!success) return { success: false, message: "Actions insuffisantes" };

        // Effet volume — la vente fait légèrement baisser le prix
        action.prix = parseFloat((action.prix * (1 - 0.001 * quantite)).toFixed(2));

        return {
            success:      true,
            solde:        player.getSolde(),
            portefeuille: player.getPortefeuilleDetail(),
            patrimoine:   player.getPatrimoine()
        };
    }

    // ── Gel de compte ─────────────────────────────────────────────────────────
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
        if (player.estGele) return { success: false, message: "Tu es gelé — impossible d'utiliser une action spéciale" };

        const cible = this.players.find(p => p.id === cibleId);
        if (!cible) return { success: false, message: "Joueur cible introuvable" };

        if (player.gelsRestants <= 0)
            return { success: false, message: "Tu as épuisé tes gels pour cette partie" };

        if (player.getSolde() < 1000)
            return { success: false, message: "Solde insuffisant" };

        if (cible.estGele)
            return { success: false, message: "Ce joueur est déjà gelé" };

        player.debiterCompte(1000);
        player.gelsRestants--;

        cible.estGele = true;
        setTimeout(() => {
            cible.estGele = false;
            console.log(`[GAME] Joueur ${cible.name} dégel automatique`);
        }, 30000);

        console.log(`[GAME] ${player.name} a gelé ${cible.name} pendant 30s`);

        return {
            success:      true,
            message:      `${cible.name} est gelé pendant 30 secondes`,
            solde:        player.getSolde(),
            gelsRestants: player.gelsRestants
        };
    }

    // ── Insider Trading (révèle μ d'une action) ──────────────────────────────
    insiderTrading(playerId, actionId) {
        const erreur = this._verifierPartieEnCours();
        if (erreur) return { success: false, message: erreur };

        if (!Number.isInteger(playerId) || playerId <= 0)
            return { success: false, message: "playerId invalide" };
        if (!Number.isInteger(actionId) || actionId <= 0)
            return { success: false, message: "actionId invalide" };

        const player = this.players.find(p => p.id === playerId);
        if (!player) return { success: false, message: "Joueur introuvable" };
        if (player.estGele) return { success: false, message: "Tu es gelé — impossible d'utiliser une action spéciale" };

        if (!this._insiderUsages[playerId]) this._insiderUsages[playerId] = 0;
        if (this._insiderUsages[playerId] >= 2)
            return { success: false, message: "Tu as épuisé tes insider trades (2 max par partie)" };

        if (player.getSolde() < 1500)
            return { success: false, message: "Solde insuffisant (coût : 1500 €)" };

        const action = this.market.getStock(actionId);
        if (!action) return { success: false, message: "Action introuvable" };

        player.debiterCompte(1500);
        this._insiderUsages[playerId]++;

        const tendance = action._mu > 0.005 ? 'haussière'
                       : action._mu < -0.005 ? 'baissière'
                       : 'neutre';

        console.log(`[GAME] ${player.name} utilise l'insider trading sur ${action.nom} (μ=${action._mu})`);

        return {
            success:          true,
            message:          `Info insider sur ${action.nom}`,
            tendance,
            actionNom:        action.nom,
            duree:            10,
            solde:            player.getSolde(),
            insiderRestants:  2 - this._insiderUsages[playerId]
        };
    }

    // ── Short Selling ────────────────────────────────────────────────────────
    ouvrirShort(playerId, actionId, quantite) {
        const erreur = this._verifierPartieEnCours() || this._validerTransaction(playerId, actionId, quantite);
        if (erreur) return { success: false, message: erreur };

        const player = this.players.find(p => p.id === playerId);
        if (!player) return { success: false, message: "Joueur introuvable" };
        if (player.estGele) return { success: false, message: "Tu es gelé" };

        const action = this.market.getStock(actionId);
        if (!action) return { success: false, message: "Action introuvable" };

        const margeRequise = parseFloat((action.prix * quantite * 0.5).toFixed(2));
        if (player.getSolde() < margeRequise)
            return { success: false, message: `Marge insuffisante (${margeRequise} € requis)` };

        player.debiterCompte(margeRequise);

        if (!this._shortPositions[playerId]) this._shortPositions[playerId] = {};
        if (!this._shortPositions[playerId][actionId]) {
            this._shortPositions[playerId][actionId] = { quantite: 0, prixEntree: 0, marge: 0 };
        }

        const pos = this._shortPositions[playerId][actionId];
        const ancienTotal = pos.quantite * pos.prixEntree;
        pos.quantite  += quantite;
        pos.prixEntree = parseFloat(((ancienTotal + action.prix * quantite) / pos.quantite).toFixed(2));
        pos.marge     += margeRequise;

        player.historique.push({
            type: 'short_ouvert', actionId: action.id, actionNom: action.nom,
            quantite, prixUnitaire: action.prix, marge: margeRequise,
            timestamp: new Date().toLocaleTimeString('fr-FR')
        });

        console.log(`[GAME] ${player.name} ouvre un short sur ${action.nom} (${quantite} @ ${action.prix})`);

        return {
            success:        true,
            message:        `Short ouvert : ${quantite}× ${action.nom} @ ${action.prix} €`,
            solde:          player.getSolde(),
            shortPositions: this.getShortPositions(playerId)
        };
    }

    fermerShort(playerId, actionId, quantite) {
        const erreur = this._verifierPartieEnCours() || this._validerTransaction(playerId, actionId, quantite);
        if (erreur) return { success: false, message: erreur };

        const player = this.players.find(p => p.id === playerId);
        if (!player) return { success: false, message: "Joueur introuvable" };

        const action = this.market.getStock(actionId);
        if (!action) return { success: false, message: "Action introuvable" };

        const pos = this._shortPositions[playerId]?.[actionId];
        if (!pos || pos.quantite < quantite)
            return { success: false, message: "Position short insuffisante" };

        const pnl           = parseFloat(((pos.prixEntree - action.prix) * quantite).toFixed(2));
        const margeRestituee = parseFloat((pos.marge * (quantite / pos.quantite)).toFixed(2));

        player.crediterCompte(margeRestituee + pnl);

        pos.quantite -= quantite;
        pos.marge    -= margeRestituee;
        if (pos.quantite === 0) {
            delete this._shortPositions[playerId][actionId];
        }

        player.historique.push({
            type: 'short_ferme', actionId: action.id, actionNom: action.nom,
            quantite, prixEntree: pos.prixEntree, prixSortie: action.prix, pnl,
            timestamp: new Date().toLocaleTimeString('fr-FR')
        });

        console.log(`[GAME] ${player.name} ferme short sur ${action.nom} (PnL: ${pnl >= 0 ? '+' : ''}${pnl} €)`);

        return {
            success:        true,
            message:        `Short fermé : ${pnl >= 0 ? '+' : ''}${pnl} € sur ${action.nom}`,
            pnl,
            solde:          player.getSolde(),
            shortPositions: this.getShortPositions(playerId)
        };
    }

    getShortPositions(playerId) {
        const positions = this._shortPositions[playerId] || {};
        const result    = {};
        for (const actionId in positions) {
            const pos    = positions[actionId];
            const action = this.market.getStock(parseInt(actionId));
            if (action && pos.quantite > 0) {
                const pnlLatent = parseFloat(((pos.prixEntree - action.prix) * pos.quantite).toFixed(2));
                result[actionId] = {
                    nom:        action.nom,
                    quantite:   pos.quantite,
                    prixEntree: pos.prixEntree,
                    prixActuel: action.prix,
                    pnlLatent,
                    pourcentage: parseFloat((((pos.prixEntree - action.prix) / pos.prixEntree) * 100).toFixed(2))
                };
            }
        }
        return result;
    }

    _liquiderShorts() {
        for (const playerId in this._shortPositions) {
            const player = this.players.find(p => p.id === parseInt(playerId));
            if (!player) continue;
            for (const actionId in this._shortPositions[playerId]) {
                const pos    = this._shortPositions[playerId][actionId];
                if (pos.quantite === 0) continue;
                const action = this.market.getStock(parseInt(actionId));
                if (!action) continue;
                const pnl = parseFloat(((pos.prixEntree - action.prix) * pos.quantite).toFixed(2));
                player.crediterCompte(pos.marge + pnl);
                console.log(`[GAME] Liquidation short ${player.name}: ${action.nom} → PnL: ${pnl}`);
            }
        }
        this._shortPositions = {};
    }

    // ── Lecture ───────────────────────────────────────────────────────────────
    verifierFinPartie() { return this.finished; }
    getTempsEcoule()    { return this.timer.getTempsEcoule(); }

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
            started:          this.started,
            finished:         this.finished,
            nbJoueurs:        this.players.length,
            joueurs:          this.getPlayers(),
            tempsEcoule:      this._formatDuree(this.getTempsEcoule()),
            regime:           this.market.getRegime(),
            dernierEvenement: this.market.getDernierEvenement(),
            classement:       this.finished ? this.calculerClassement() : null,
            stats:            this.finished ? this._stats : null,
            dureePartie:      this.finished ? this.timer.getDureeTotale() : null
        };
    }

    _formatDuree(ms) {
        const totalSecondes = Math.floor(ms / 1000);
        const minutes  = Math.floor(totalSecondes / 60);
        const secondes = totalSecondes % 60;
        return `${minutes}m ${secondes.toString().padStart(2, '0')}s`;
    }

    // ── Rumeurs ───────────────────────────────────────────────────────────────
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
        if (player.estGele) return { success: false, message: "Tu es gelé — impossible d'utiliser une action spéciale" };

        if (player.rumeursRestantes <= 0)
            return { success: false, message: "Tu as épuisé tes rumeurs pour cette partie" };

        if (player.getSolde() < 500)
            return { success: false, message: "Solde insuffisant — la rumeur coûte 500 crédits" };

        const COOLDOWN    = 60000;
        const tempsRestant = COOLDOWN - (Date.now() - (this._derniereRumeur[playerId] || 0));
        if (tempsRestant > 0)
            return { success: false, message: `Cooldown actif — attends encore ${Math.ceil(tempsRestant / 1000)}s` };

        const action = this.market.getStock(actionId);
        if (!action) return { success: false, message: "Action introuvable" };

        player.debiterCompte(500);
        player.rumeursRestantes--;

        const impact = positif ? 0.08 : -0.08;
        action._rumeurImpact = positif ? 0.01 : -0.01;

        setTimeout(() => {
            action._rumeurImpact = positif ? -0.03 : 0.03;
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
            success:          true,
            message:          `Rumeur ${positif ? 'positive' : 'négative'} répandue sur ${action.nom}`,
            solde:            player.getSolde(),
            rumeursRestantes: player.rumeursRestantes
        };
    }

    // ── Statistiques de fin de partie ─────────────────────────────────────────
    _calculerStats() {
        const statsParJoueur = {};

        for (const player of this.players) {
            const hist           = player.getHistorique();
            const nbTransactions = hist.length;

            let meilleureTransaction = null;
            let meilleurGain         = -Infinity;
            const actionsTraded      = {};

            for (const tx of hist) {
                if (tx.type === 'vente' && tx.plusValue !== undefined && tx.plusValue > meilleurGain) {
                    meilleurGain         = tx.plusValue;
                    meilleureTransaction = tx;
                }
                const nom = tx.actionNom || `Action #${tx.actionId}`;
                actionsTraded[nom] = (actionsTraded[nom] || 0) + 1;
            }

            let actionPlusTradee = null;
            let maxTrades        = 0;
            for (const [nom, count] of Object.entries(actionsTraded)) {
                if (count > maxTrades) {
                    maxTrades        = count;
                    actionPlusTradee = nom;
                }
            }

            statsParJoueur[player.id] = {
                name:            player.name,
                nbTransactions,
                meilleureTransaction: meilleureTransaction ? {
                    actionNom:    meilleureTransaction.actionNom,
                    gain:         meilleurGain,
                    prixUnitaire: meilleureTransaction.prixUnitaire,
                    quantite:     meilleureTransaction.quantite
                } : null,
                actionPlusTradee: actionPlusTradee ? { nom: actionPlusTradee, count: maxTrades } : null
            };
        }

        return {
            joueurs:     statsParJoueur,
            dureePartie: this.timer.getDureeTotale()
        };
    }
}

export default Game;