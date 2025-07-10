import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { 
    saveQuiz, 
    getQuizByCourse,
    getQuizForStudent,
    submitQuiz,
    getQuizResult
} from "../controllers/quiz.controller.js";

const router = express.Router();

router.route("/course/:courseId")
    .post(isAuthenticated, saveQuiz)
    .get(isAuthenticated, getQuizByCourse);

router.route("/student/course/:courseId").get(isAuthenticated, getQuizForStudent);
router.route("/course/:courseId/submit").post(isAuthenticated, submitQuiz);
router.route("/result/:attemptId").get(isAuthenticated, getQuizResult);

export default router;