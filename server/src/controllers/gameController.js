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

export const getActions          = (req, res) => res.json({ actions: game.market.getAllActions() });
export const getDernierEvenement = (req, res) => res.json({ evenement: game.market.getDernierEvenement() });

