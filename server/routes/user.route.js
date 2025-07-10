import express from "express";
import { 
    getUserProfile, 
    login, 
    logout, 
    register, 
    updateProfile,
    verifyEmail,
    forgotPassword,
    resetPassword,
    changePassword,
    getTransactionHistory,
    requestInstructorRole,
    verifyPassword,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/profile/update").put(isAuthenticated, upload.single("profilePhoto"), updateProfile);
router.route("/profile/change-password").put(isAuthenticated, changePassword);
router.route("/profile/transactions").get(isAuthenticated, getTransactionHistory);
router.route("/profile/request-instructor").post(isAuthenticated, requestInstructorRole);
router.route("/profile/verify-password").post(isAuthenticated, verifyPassword);
router.route("/verify-email/:token").get(verifyEmail);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);

export default router;