import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { sendCertificateByEmail } from "../controllers/certificate.controller.js";

const router = express.Router();

router.route("/:attemptId/send").post(isAuthenticated, sendCertificateByEmail);

export default router;