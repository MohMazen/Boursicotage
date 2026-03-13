import game from '../instance/game_instance.js';

export const acheterAction = (req, res) => {
    const { playerId, actionId, quantite } = req.body;

    const playerIdInt  = parseInt(playerId);
    const actionIdInt  = parseInt(actionId);
    const quantiteInt  = parseInt(quantite);

    if (isNaN(playerIdInt) || isNaN(actionIdInt) || isNaN(quantiteInt))
        return res.status(400).json({ message: "playerId, actionId et quantite doivent être des entiers" });

    const result = game.acheter(playerIdInt, actionIdInt, quantiteInt);
    if (!result.success) return res.status(400).json({ message: result.message });

    res.json(result);
};

export const vendreAction = (req, res) => {
    const { playerId, actionId, quantite } = req.body;

    const playerIdInt  = parseInt(playerId);
    const actionIdInt  = parseInt(actionId);
    const quantiteInt  = parseInt(quantite);

    if (isNaN(playerIdInt) || isNaN(actionIdInt) || isNaN(quantiteInt))
        return res.status(400).json({ message: "playerId, actionId et quantite doivent être des entiers" });

    const result = game.vendre(playerIdInt, actionIdInt, quantiteInt);
    if (!result.success) return res.status(400).json({ message: result.message });

    res.json(result);
};
