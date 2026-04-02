import express from "express";
import {
    demarrerPartie,
    terminerPartie,
    getEtatPartie,
    getClassement,
    getActions,
    getDernierEvenement,
    repandreRumeur,
    gelerJoueur,
    insiderTrading,
    ouvrirShort,
    fermerShort,
    getShortPositions,
    setPlayerReady,
    quitterPartie,
    resetPartie
} from '../controllers/gameController.js';

const router = express.Router();

router.route('/game/start').post(demarrerPartie);
router.route('/game/end').post(terminerPartie);
router.route('/game/state').get(getEtatPartie);
router.route('/game/classement').get(getClassement);
router.route('/game/leave').post(quitterPartie);
router.route('/game/reset').post(resetPartie);

// ─── Marché ─────────────────────────────────────────────────────────────────
router.route('/market/actions').get(getActions);
router.route('/market/evenement').get(getDernierEvenement);

// ─── Rumeurs ────────────────────────────────────────────────────────────────
router.route('/market/rumeur').post(repandreRumeur);

// ─── Gel ────────────────────────────────────────────────────────────────────
router.route('/market/geler').post(gelerJoueur);

// ─── Insider Trading ────────────────────────────────────────────────────────
router.route('/market/insider').post(insiderTrading);

// ─── Short Selling ──────────────────────────────────────────────────────────
router.route('/market/short/ouvrir').post(ouvrirShort);
router.route('/market/short/fermer').post(fermerShort);
router.route('/market/short/:playerId').get(getShortPositions);

// ─── Lobby ──────────────────────────────────────────────────────────────────
router.route('/game/ready').post(setPlayerReady);

export default router;
