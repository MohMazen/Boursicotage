import game from '../instance/game_instance.js';
// ─── Transactions ─
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