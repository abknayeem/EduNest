import { User } from "../models/user.model.js";

const isSuperadmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.id);
        if (!user || user.role !== 'superadmin') {
            return res.status(403).json({
                message: "Access denied. Not a superadmin.",
                success: false,
            });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error verifying superadmin status.",
            success: false,
        });
    }
};

export default isSuperadmin;