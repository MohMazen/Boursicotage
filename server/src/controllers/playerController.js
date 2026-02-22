import game from '../instance/game.instance.js';

// ─── Portefeuille ────────────────────────────────────────────────────────────

export const getPortefeuille = (req, res) => {
    const { playerId } = req.params;

    const player = game.players.find(p => p.id == playerId);
    if (!player) {
        return res.status(404).json({ message: "Joueur introuvable" });
    }

    res.json({
        solde:        player.getSolde(),
        portefeuille: player.getPortefeuilleDetail(),
        patrimoine:   player.getPatrimoine()
    });
};

// ─── Transactions ────────────────────────────────────────────────────────────

export const acheterAction = (req, res) => {
    const { playerId, actionId, quantite } = req.body;

    if (!playerId || !actionId || quantite == null) {
        return res.status(400).json({ message: "Les champs 'playerId', 'actionId' et 'quantite' sont requis" });
    }

    // La méthode game.acheter() vérifie elle-même si la partie est en cours
    const result = game.acheter(playerId, actionId, parseInt(quantite));

    if (!result.success) {
        return res.status(400).json({ message: result.message });
    }

    res.json({
        message:      "Achat effectué avec succès",
        solde:        result.solde,
        portefeuille: result.portefeuille,
        patrimoine:   result.patrimoine
    });
};

export const vendreAction = (req, res) => {
    const { playerId, actionId, quantite } = req.body;

    if (!playerId || !actionId || quantite == null) {
        return res.status(400).json({ message: "Les champs 'playerId', 'actionId' et 'quantite' sont requis" });
    }

    // La méthode game.vendre() vérifie elle-même si la partie est en cours
    const result = game.vendre(playerId, actionId, parseInt(quantite));

    if (!result.success) {
        return res.status(400).json({ message: result.message });
    }

    res.json({
        message:      "Vente effectuée avec succès",
        solde:        result.solde,
        portefeuille: result.portefeuille,
        patrimoine:   result.patrimoine
    });
};

// ─── Actions spéciales ───────────────────────────────────────────────────────

export const repandreRumeur = (req, res) => {
    const { playerId, actionId, positif } = req.body;

    if (!playerId || !actionId) {
        return res.status(400).json({ message: "Les champs 'playerId' et 'actionId' sont requis" });
    }

    if (!game.started) {
        return res.status(400).json({ message: "Partie non démarrée" });
    }

    if (game.finished) {
        return res.status(400).json({ message: "Partie déjà terminée" });
    }

    const player = game.players.find(p => p.id === playerId);
    if (!player) {
        return res.status(404).json({ message: "Joueur introuvable" });
    }

    const success = game.market.repandreRumeur(actionId, positif !== false);

    if (!success) {
        return res.status(404).json({ message: "Action introuvable" });
    }

    res.json({
        message: `Rumeur ${positif !== false ? 'positive' : 'négative'} répandue sur l'action ${actionId}`
    });
};
