import express from "express";
import {
  deleteInstructor,
  getAllCoursesForAdmin,
  getAllInstructors,
  getAllUsers,
  getCategoryStats,
  getInstructorDetails,
  getInstructorMonthlySales,
  getPlatformAnalytics,
  getPlatformStats,
  updateCoursePublicationStatus,
  updateUserRole,
  getUserDetailsForAdmin,
  createUserByAdmin,
  deleteUser,
  getAllTransactions,
  getPendingRequestsCount,
  refuseInstructorRequest,
  updateUserStatus,
  getQuizAttempts,
  getUserCourseProgress,
  getPlatformFinancials,
  getPlatformFinancialsReport,
} from "../controllers/admin.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isSuperadmin from "../middlewares/isSuperadmin.js";

const router = express.Router();

router.route("/stats").get(isAuthenticated, isSuperadmin, getPlatformStats);
router.route("/analytics").get(isAuthenticated, isSuperadmin, getPlatformAnalytics);
router.route("/financials").get(isAuthenticated, isSuperadmin, getPlatformFinancials);
router.route("/pending-requests/count").get(isAuthenticated, isSuperadmin, getPendingRequestsCount);
router.route("/instructors").get(isAuthenticated, isSuperadmin, getAllInstructors);
router.route("/instructors/:instructorId").delete(isAuthenticated, isSuperadmin, deleteInstructor);
router.route("/instructors/:instructorId/analytics").get(isAuthenticated, isSuperadmin, getInstructorMonthlySales);
router.route("/instructors/:instructorId/details").get(isAuthenticated, isSuperadmin, getInstructorDetails);
router.route("/users").get(isAuthenticated, isSuperadmin, getAllUsers);
router.route("/users/create").post(isAuthenticated, isSuperadmin, createUserByAdmin);
router.route("/users/:userId/role").patch(isAuthenticated, isSuperadmin, updateUserRole);
router.route("/users/:userId/details").get(isAuthenticated, isSuperadmin, getUserDetailsForAdmin);
router.route("/users/:userId").delete(isAuthenticated, isSuperadmin, deleteUser);
router.route("/users/:userId/refuse-instructor").patch(isAuthenticated, isSuperadmin, refuseInstructorRequest);
router.route("/users/:userId/status").patch(isAuthenticated, isSuperadmin, updateUserStatus);
router.route("/courses").get(isAuthenticated, isSuperadmin, getAllCoursesForAdmin);
router.route("/courses/:courseId/publish").patch(isAuthenticated, isSuperadmin, updateCoursePublicationStatus);
router.route("/categories/stats").get(isAuthenticated, isSuperadmin, getCategoryStats);
router.route("/transactions").get(isAuthenticated, isSuperadmin, getAllTransactions);
router.route("/quiz-attempts").get(isAuthenticated, isSuperadmin, getQuizAttempts);
router.route("/users/:userId/progress/:courseId").get(isAuthenticated, isSuperadmin, getUserCourseProgress);

router.route("/financials/report").get(isAuthenticated, isSuperadmin, getPlatformFinancialsReport);

export default router;
