import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isSuperadmin from "../middlewares/isSuperadmin.js";
import { 
    requestPayout, 
    getPendingPayouts, 
    completePayout,
    declinePayout,
    getPayoutHistoryForInstructor,
    getPayoutHistory
} from "../controllers/payout.controller.js";

const router = express.Router();

router.route("/request").post(isAuthenticated, requestPayout);
router.route("/history").get(isAuthenticated, getPayoutHistoryForInstructor);
router.route("/pending").get(isAuthenticated, isSuperadmin, getPendingPayouts);
router.route("/history/all").get(isAuthenticated, isSuperadmin, getPayoutHistory);
router.route("/:payoutId/complete").patch(isAuthenticated, isSuperadmin, completePayout);
router.route("/:payoutId/decline").patch(isAuthenticated, isSuperadmin, declinePayout);

export default router;