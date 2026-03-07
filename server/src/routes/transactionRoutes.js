import {Router} from "express";
import{
    acheterAction,
    vendreAction
} from "../controllers/transactionController.js"

const router = Router();

// ─── Transactions ────────────────────────────
router
    .route('/market/acheter')
    .post(acheterAction);
router
    .route('/market/vendre')
    .post(vendreAction);

export default router;