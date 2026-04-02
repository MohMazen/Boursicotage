import game from '../instance/game_instance.js';
import Player from "../models/Player.js";

export const ajouterJoueur = (req, res) => {
    const { name, sessionToken } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '')
        return res.status(400).json({ message: "Le champ 'name' est requis" });

    const trimmedName = name.trim();

    // Vérifier si le joueur existe déjà
    const existingPlayer = game.players.find(p => p.name.toLowerCase() === trimmedName.toLowerCase());
    
    if (existingPlayer) {
        // Sécurité : si le token envoyé ne correspond pas, c'est quelqu'un d'autre qui tente de voler le pseudo
        if (existingPlayer.sessionToken && existingPlayer.sessionToken !== sessionToken) {
            return res.status(403).json({ message: "Ce pseudo est déjà utilisé !" });
        }
        
        // Si c'est le bon token, on récupère la session existante (refresh ou double-mount)
        return res.json({ 
            message: "Session récupérée", 
            joueur: { id: existingPlayer.id, name: existingPlayer.name } 
        });
    }

    // Reset avant de créer le joueur si partie terminée
    if (game.finished) {
        game.preparerNouvellePartie();
    }

    const player  = new Player(trimmedName, sessionToken);
    const success = game.addPlayer(player);

    if (!success)
        return res.status(400).json({ message: "Impossible d'ajouter le joueur (partie déjà démarrée)" });

    res.json({ message: "Joueur ajouté", joueur: { id: player.id, name: player.name } });
};

export const demarrerPartie = (req, res) => {
    if (game.finished) {
        return res.status(400).json({ message: "Partie terminée — inscrivez les joueurs avant de redémarrer" });
    }

    const result = game.demarrer();
    if (!result.success) return res.status(400).json({ message: result.message });
    res.json({ message: "Partie démarrée" });
};

export const getEtatPartie    = (req, res) => res.json(game.getGameState());
export const getTempsEcoule   = (req, res) => res.json({ tempsEcoule: game.getTempsEcoule() });

export const getClassement = (req, res) => {
    if (!game.verifierFinPartie())
        return res.status(400).json({ message: "La partie n'est pas encore terminée" });
    res.json({ classement: game.calculerClassement() });
};

export const terminerPartie = (req, res) => {
    if (game.verifierFinPartie())
        return res.status(400).json({ message: "La partie est déjà terminée" });
    game.terminer();
    res.json({ message: "Partie terminée manuellement", classement: game.calculerClassement() });
};

export const quitterPartie = (req, res) => {
    const { playerId } = req.body;
    if (playerId) {
        game.removePlayer(parseInt(playerId));
    }
    const io = game.market._io;
    if (io) {
        io.emit('lobby:update', { players: game.getPlayers() });
    }
    res.json({ message: "Vous avez quitté la partie" });
};

export const resetPartie = (req, res) => {
    game.preparerNouvellePartie();
    res.json({ message: "La partie complète a été fermée et réinitialisée" });
};

export const getActions          = (req, res) => res.json({ actions: game.market.getAllStocks() });
export const getDernierEvenement = (req, res) => res.json({ evenement: game.market.getDernierEvenement() });

export const repandreRumeur = (req, res) => {
    const { playerId, actionId, positif } = req.body;

    const playerIdInt = parseInt(playerId);
    const actionIdInt = parseInt(actionId);

    if (isNaN(playerIdInt) || isNaN(actionIdInt))
        return res.status(400).json({ message: "playerId et actionId doivent être des entiers" });

    if (typeof positif !== 'boolean')
        return res.status(400).json({ message: "positif doit être un booléen JSON (true ou false, sans guillemets)" });

    const result = game.repandreRumeur(playerIdInt, actionIdInt, positif);
    if (!result.success) return res.status(400).json({ message: result.message });

    res.json(result);
};

export const gelerJoueur = (req, res) => {
    const { playerId, cibleId } = req.body;

    const playerIdInt = parseInt(playerId);
    const cibleIdInt  = parseInt(cibleId);

    if (isNaN(playerIdInt) || isNaN(cibleIdInt))
        return res.status(400).json({ message: "playerId et cibleId doivent être des entiers" });

    const result = game.gelerJoueur(playerIdInt, cibleIdInt);
    if (!result.success) return res.status(400).json({ message: result.message });

    res.json(result);
};

// ── Insider Trading ──────────────────────────────────────────────────────────
export const insiderTrading = (req, res) => {
    const { playerId, actionId } = req.body;

    const playerIdInt = parseInt(playerId);
    const actionIdInt = parseInt(actionId);

    if (isNaN(playerIdInt) || isNaN(actionIdInt))
        return res.status(400).json({ message: "playerId et actionId doivent être des entiers" });

    const result = game.insiderTrading(playerIdInt, actionIdInt);
    if (!result.success) return res.status(400).json({ message: result.message });

    res.json(result);
};

// ── Short Selling ────────────────────────────────────────────────────────────
export const ouvrirShort = (req, res) => {
    const { playerId, actionId, quantite } = req.body;

    const playerIdInt = parseInt(playerId);
    const actionIdInt = parseInt(actionId);
    const quantiteInt = parseInt(quantite);

    if (isNaN(playerIdInt) || isNaN(actionIdInt) || isNaN(quantiteInt))
        return res.status(400).json({ message: "playerId, actionId et quantite doivent être des entiers" });

    const result = game.ouvrirShort(playerIdInt, actionIdInt, quantiteInt);
    if (!result.success) return res.status(400).json({ message: result.message });

    res.json(result);
};

export const fermerShort = (req, res) => {
    const { playerId, actionId, quantite } = req.body;

    const playerIdInt = parseInt(playerId);
    const actionIdInt = parseInt(actionId);
    const quantiteInt = parseInt(quantite);

    if (isNaN(playerIdInt) || isNaN(actionIdInt) || isNaN(quantiteInt))
        return res.status(400).json({ message: "playerId, actionId et quantite doivent être des entiers" });

    const result = game.fermerShort(playerIdInt, actionIdInt, quantiteInt);
    if (!result.success) return res.status(400).json({ message: result.message });

    res.json(result);
};

export const getShortPositions = (req, res) => {
    const playerIdInt = parseInt(req.params.playerId);
    if (isNaN(playerIdInt))
        return res.status(400).json({ message: "playerId invalide" });

    res.json({ shorts: game.getShortPositions(playerIdInt) });
};

// ── Lobby : prêt ─────────────────────────────────────────────────────────────
export const setPlayerReady = (req, res) => {
    const { playerId, ready } = req.body;
    const playerIdInt = parseInt(playerId);

    if (isNaN(playerIdInt))
        return res.status(400).json({ message: "playerId invalide" });

    const success = game.setPlayerReady(playerIdInt, ready !== false);
    if (!success) return res.status(404).json({ message: "Joueur introuvable" });

    res.json({ message: "Statut mis à jour", players: game.getPlayers() });
};