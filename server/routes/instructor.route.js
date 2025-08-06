import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getEnrolledStudentsForInstructor,
  getInstructorAnalytics,
  getQuizAttemptsForCourse,
  getStudentProgress,
  getInstructorFinancials,
  getInstructorFinancialsReport,
} from "../controllers/instructor.controller.js";

const router = express.Router();

router
  .route("/students")
  .get(isAuthenticated, getEnrolledStudentsForInstructor);
router.route("/analytics").get(isAuthenticated, getInstructorAnalytics);
router.route("/financials").get(isAuthenticated, getInstructorFinancials);
router
  .route("/course/:courseId/quiz-attempts")
  .get(isAuthenticated, getQuizAttemptsForCourse);
router
  .route("/student-progress/:courseId/:studentId")
  .get(isAuthenticated, getStudentProgress);

router.route("/financials/report").get(isAuthenticated, getInstructorFinancialsReport);

export default router;
