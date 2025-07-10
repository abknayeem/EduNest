import { Category } from "../models/category.model.js";

export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: "Category name is required." });
        }

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(409).json({ success: false, message: "Category already exists." });
        }

        const category = await Category.create({ name });
        res.status(201).json({ success: true, message: "Category created successfully.", category });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.status(200).json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const category = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true });

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }

        res.status(200).json({ success: true, message: "Category updated successfully.", category });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }

        res.status(200).json({ success: true, message: "Category deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};