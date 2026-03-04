import game from '../instance/game_instance.js';

// ─── Portefeuille ──

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
// ────────────────────────────────────────────────────────────
export const getHistorique = (req, res) => {
    const playerId = parseInt(req.params.playerId);
    if (isNaN(playerId)) return res.status(400).json({ message: "playerId invalide" });
    const player = game.players.find(p => p.id === playerId);
    if (!player) return res.status(404).json({ message: "Joueur introuvable" });
    res.json({ historique: player.getHistorique() });
};




