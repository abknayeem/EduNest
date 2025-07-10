import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isSuperadmin from "../middlewares/isSuperadmin.js";
import {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
} from "../controllers/category.controller.js";

const router = express.Router();

router.route("/").get(getAllCategories);

router.route("/").post(isAuthenticated, isSuperadmin, createCategory);
router.route("/:id").patch(isAuthenticated, isSuperadmin, updateCategory);
router.route("/:id").delete(isAuthenticated, isSuperadmin, deleteCategory);

export default router;