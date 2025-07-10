import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { 
    getEnrolledStudentsForInstructor, 
    getInstructorAnalytics,
    getQuizAttemptsForCourse
} from "../controllers/instructor.controller.js";

const router = express.Router();

router.route("/students").get(isAuthenticated, getEnrolledStudentsForInstructor);
router.route("/analytics").get(isAuthenticated, getInstructorAnalytics);
router.route("/course/:courseId/quiz-attempts").get(isAuthenticated, getQuizAttemptsForCourse);

export default router;