import game from '../instance/game_instance.js';
import Player from "../models/Player.js";

export const ajouterJoueur = (req, res) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '')
        return res.status(400).json({ message: "Le champ 'name' est requis" });

    //  Reset avant de créer le joueur si partie terminée
    if (game.finished) {
        game.preparerNouvellePartie();
    }

    const player  = new Player(name.trim());
    const success = game.addPlayer(player);

    if (!success)
        return res.status(400).json({ message: "Impossible d'ajouter le joueur (partie déjà démarrée)" });

    res.json({ message: "Joueur ajouté", joueur: { id: player.id, name: player.name } });
};
export const demarrerPartie = (req, res) => {
    const success = game.demarrer();
    if (!success) return res.status(400).json({ message: "Impossible de démarrer la partie (nombre de joueurs insuffisant)" });
    res.json({ message: "Partie démarrée" });
};

export const getEtatPartie    = (req, res) => res.json(game.getGameState());
export const getTempsEcoule   = (req, res) => res.json({ tempsEcoule: game.getTempsEcoule() });
export const getDureeRestante = (req, res) => res.json({ dureeRestante: game.getDureeRestante() });

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