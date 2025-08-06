import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { 
    getQuestionsForLecture, 
    postQuestion, 
    postAnswer, 
    getQuestionsForCourse,
    updateAnswer,
    deleteAnswer
} from "../controllers/qna.controller.js";

const router = express.Router();
router.route("/lecture/:lectureId/questions").get(isAuthenticated, getQuestionsForLecture);
router.route("/lecture/:lectureId/questions").post(isAuthenticated, postQuestion);
router.route("/course/:courseId/questions").get(isAuthenticated, getQuestionsForCourse);
router.route("/questions/:questionId/answers").post(isAuthenticated, postAnswer);
router.route("/answers/:answerId")
    .patch(isAuthenticated, updateAnswer)
    .delete(isAuthenticated, deleteAnswer);

export default router;
