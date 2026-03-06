import express from "express";
import {
    demarrerPartie,
    terminerPartie,
    getEtatPartie,
    getClassement,
    getActions,
    getDernierEvenement,
} from '../controllers/gameController.js';

const router = express.Router();

router
    .route('/game/start')
    .post(demarrerPartie);

router
    .route('/game/end')
    .post(terminerPartie);
router
    .route('/game/state')
    .get(getEtatPartie);

router
    .route('/game/classement')
    .get(getClassement);

// ─── Marché ───────────────────────────────────────────────────────────────────
router
    .route('/market/actions')
    .get(getActions);
router
    .route('/market/evenement')
    .get(getDernierEvenement);


export default router;
