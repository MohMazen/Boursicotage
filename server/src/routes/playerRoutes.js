import {Router} from "express";
import{
    getPortefeuille,
    getHistorique
} from "../controllers/playerController.js"
import {
    ajouterJoueur,
} from '../controllers/gameController.js';

const router = Router(); 

router
    .route("/joueurs")
    .post(ajouterJoueur);
router
    .route("/joueurs/:playerId/portefeuille")
    .get(getPortefeuille);

router
    .route("/joueurs/:playerId/historique")
    .get(getHistorique);

export default router;

