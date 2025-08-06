import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
// Layouts
import MainLayout from "@/layout/MainLayout";
import SuperadminLayout from "@/layout/SuperadminLayout";
// Components for Protected Routes
import {
  AdminRoute,
  AuthenticatedUser,
  ProtectedRoute,
} from "@/components/ProtectedRoutes";
import PurchaseCourseProtectedRoute from "@/components/PurchaseCourseProtectedRoute";
import { SuperadminRoute } from "@/components/SuperadminRoute";
import { ThemeProvider } from "@/components/ThemeProvider";
// General Pages
import Login from "@/pages/login";
import TermsAndConditions from "@/pages/TermsAndConditions";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import BecomeAnInstructor from "@/pages/BecomeAnInstructor";
import AboutUs from "@/pages/AboutUs";
import VerifyEmail from "@/pages/VerifyEmail";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
// Student Pages
import HeroSection from "@/pages/student/HeroSection";
import Courses from "@/pages/student/Courses";
import CourseDetail from "@/pages/student/CourseDetail";
import SearchPage from "@/pages/student/SearchPage";
import MyLearning from "@/pages/student/MyLearning";
import Profile from "@/pages/student/Profile";
import CourseProgress from "@/pages/student/CourseProgress";
import QuizTaker from "@/pages/student/QuizTaker";
import QuizResult from "@/pages/student/QuizResult";
// Instructor (Admin) Pages
import Sidebar from "@/pages/admin/Sidebar";
import AnalyticsDashboard from "@/pages/admin/AnalyticsDashboard";
import CourseTable from "@/pages/admin/course/CourseTable";
import AddCourse from "@/pages/admin/course/AddCourse";
import EditCourse from "@/pages/admin/course/EditCourse";
import CreateLecture from "@/pages/admin/lecture/CreateLecture";
import EditLecture from "@/pages/admin/lecture/EditLecture";
import QuizEditor from "@/pages/admin/course/QuizEditor";
import QnaManagement from "@/pages/admin/course/QnaManagement";
import EnrolledStudents from "@/pages/admin/EnrolledStudents";
import QuizResults from "@/pages/admin/course/QuizResults";
import InstructorFinancials from "@/pages/admin/Financials";
// Superadmin Pages
import SuperadminLogin from "@/pages/superadmin/SuperadminLogin";
import SuperadminDashboard from "@/pages/superadmin/SuperadminDashboard";
import SuperadminAnalytics from "@/pages/superadmin/AnalyticsDashboard";
import UserManagement from "@/pages/superadmin/UserManagement";
import UserDetails from "@/pages/superadmin/UserDetails";
import CourseManagement from "@/pages/superadmin/CourseManagement";
import CategoryManagement from "@/pages/superadmin/CategoryManagement";
import InstructorManagement from "@/pages/superadmin/InstructorManagement";
import InstructorDetails from "@/pages/superadmin/InstructorDetails";
import TransactionManagement from "@/pages/superadmin/TransactionManagement";
import PayoutManagement from "@/pages/superadmin/PayoutManagement";
import SuperadminFinancials from "@/pages/superadmin/Financials";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: (
          <>
            <HeroSection />
            <Courses />
          </>
        ),
      },
      {
        path: "login",
        element: (
          <AuthenticatedUser>
            <Login />
          </AuthenticatedUser>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <AuthenticatedUser>
            <ForgotPassword />
          </AuthenticatedUser>
        ),
      },
      {
        path: "reset-password/:token",
        element: (
          <AuthenticatedUser>
            <ResetPassword />
          </AuthenticatedUser>
        ),
      },
      { path: "verify-email/:token", element: <VerifyEmail /> },
      { path: "terms-and-conditions", element: <TermsAndConditions /> },
      { path: "privacy-policy", element: <PrivacyPolicy /> },
      { path: "become-an-instructor", element: <BecomeAnInstructor /> },
      { path: "about-us", element: <AboutUs /> },
      {
        path: "my-learning",
        element: (
          <ProtectedRoute>
            <MyLearning />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      { path: "course/search", element: <SearchPage /> },
      { path: "course-detail/:courseId", element: <CourseDetail /> },
      {
        path: "course-progress/:courseId",
        element: (
          <ProtectedRoute>
            <PurchaseCourseProtectedRoute>
              <CourseProgress />
            </PurchaseCourseProtectedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: "course/:courseId/quiz",
        element: (
          <ProtectedRoute>
            <QuizTaker />
          </ProtectedRoute>
        ),
      },
      {
        path: "quiz/result/:attemptId",
        element: (
          <ProtectedRoute>
            <QuizResult />
          </ProtectedRoute>
        ),
      },
      {
        // Instructor Admin Routes (protected by AdminRoute)
        path: "admin",
        element: (
          <AdminRoute>
            <Sidebar />
          </AdminRoute>
        ),
        children: [
          { path: "analytics", element: <AnalyticsDashboard /> },
          { path: "course", element: <CourseTable /> },
          { path: "enrolled-students", element: <EnrolledStudents /> },
          { path: "course/create", element: <AddCourse /> },
          { path: "course/:courseId", element: <EditCourse /> },
          { path: "course/:courseId/lecture", element: <CreateLecture /> },
          {
            path: "course/:courseId/lecture/:lectureId",
            element: <EditLecture />,
          },
          { path: "course/:courseId/quiz", element: <QuizEditor /> },
          { path: "course/:courseId/qna", element: <QnaManagement /> },
          { path: "course/:courseId/quiz-results", element: <QuizResults /> },
          { path: "financials", element: <InstructorFinancials /> },
        ],
      },
    ],
  },
  {
    // Dedicated route for Superadmin
    path: "/sadmin-login",
    element: <SuperadminLogin />,
  },
  {
    // Superadmin Protected Routes
    path: "/sadmin",
    element: <SuperadminRoute />,
    children: [
      {
        element: <SuperadminLayout />,
        children: [
          { path: "dashboard", element: <SuperadminDashboard /> },
          { path: "analytics", element: <SuperadminAnalytics /> },
          { path: "users", element: <UserManagement /> },
          { path: "users/:userId/details", element: <UserDetails /> },
          { path: "instructor-management", element: <InstructorManagement /> },
          {
            path: "instructor-details/:instructorId",
            element: <InstructorDetails />,
          },
          { path: "courses", element: <CourseManagement /> },
          { path: "categories", element: <CategoryManagement /> },
          { path: "transactions", element: <TransactionManagement /> },
          { path: "payouts", element: <PayoutManagement /> },
          { path: "financials", element: <SuperadminFinancials /> }, 
        ],
      },
    ],
  },
]);

function App() {
  return (
    <main>
      <ThemeProvider>
        <RouterProvider router={appRouter} />
      </ThemeProvider>
    </main>
  );
}

export default App;
