import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { QuizAttempt } from "../models/quizAttempt.model.js";
import { CourseProgress } from "../models/courseProgress.js";
import { Payout } from "../models/payout.model.js";
import mongoose from "mongoose";

const getEnrolledStudentsForInstructor = async (req, res) => {
  try {
    const instructorId = req.id;

    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.role !== "instructor") {
      return res
        .status(403)
        .json({ message: "Access denied. Not an instructor." });
    }

    const courses = await Course.find({ creator: instructorId }).select("_id");
    const courseIds = courses.map((course) => course._id);
    const purchases = await CoursePurchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    })
      .populate({
        path: "userId",
        select: "name email photoUrl",
      })
      .populate({
        path: "courseId",
        select: "courseTitle",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      enrolledStudents: purchases,
    });
  } catch (error) {
    console.log("Error in getEnrolledStudentsForInstructor: ", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getInstructorAnalytics = async (req, res) => {
  try {
    const instructorId = new mongoose.Types.ObjectId(req.id);
    const { period = "monthly" } = req.query;

    const courses = await Course.find({ creator: instructorId }).select("_id");
    if (courses.length === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          totalRevenue: 0,
          totalSales: 0,
          totalStudents: 0,
          totalCourses: 0,
          timeSeriesData: [],
          topCourses: [],
        },
      });
    }
    const courseIds = courses.map((c) => c._id);

    const totalCourses = courseIds.length;
    const studentCountResult = await Course.aggregate([
      { $match: { creator: instructorId } },
      { $unwind: "$enrolledStudents" },
      {
        $group: {
          _id: null,
          totalStudents: { $addToSet: "$enrolledStudents" },
        },
      },
      { $project: { count: { $size: "$totalStudents" } } },
    ]);
    const totalStudents =
      studentCountResult.length > 0 ? studentCountResult[0].count : 0;

    let dateFilter = {};
    let groupUnit = {};
    let timeSeriesLimit = 12;
    let sortOrder = { "_id.year": -1, "_id.month": -1 };

    switch (period) {
      case "daily":
        dateFilter = {
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        };
        groupUnit = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
        sortOrder = { "_id.year": -1, "_id.month": -1, "_id.day": -1 };
        timeSeriesLimit = 30;
        break;
      case "weekly":
        dateFilter = {
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 84)),
          },
        };
        groupUnit = {
          year: { $isoWeekYear: "$createdAt" },
          week: { $isoWeek: "$createdAt" },
        };
        sortOrder = { "_id.year": -1, "_id.week": -1 };
        timeSeriesLimit = 12;
        break;
      case "yearly":
        groupUnit = { year: { $year: "$createdAt" } };
        sortOrder = { "_id.year": -1 };
        timeSeriesLimit = 5;
        break;
      default:
        dateFilter = {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        };
        groupUnit = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };
        sortOrder = { "_id.year": -1, "_id.month": -1 };
        timeSeriesLimit = 12;
        break;
    }

    const analyticsData = await CoursePurchase.aggregate([
      {
        $match: {
          courseId: { $in: courseIds },
          status: "completed",
          ...dateFilter,
        },
      },
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$amount" },
                totalSales: { $sum: 1 },
              },
            },
          ],
          timeSeriesData: [
            { $group: { _id: groupUnit, revenue: { $sum: "$amount" } } },
            { $sort: sortOrder },
            { $limit: timeSeriesLimit },
            { $project: { _id: 0, dateInfo: "$_id", revenue: "$revenue" } },
          ],
          topCourses: [
            { $group: { _id: "$courseId", revenue: { $sum: "$amount" } } },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "courses",
                localField: "_id",
                foreignField: "_id",
                as: "courseInfo",
              },
            },
            { $unwind: "$courseInfo" },
            {
              $project: {
                _id: 1,
                title: "$courseInfo.courseTitle",
                revenue: 1,
              },
            },
          ],
        },
      },
    ]);

    const formatLabel = (dateInfo, period) => {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      switch (period) {
        case "daily":
          return `${dateInfo.day}/${months[dateInfo.month - 1]}`;
        case "weekly":
          return `W${dateInfo.week}, ${dateInfo.year}`;
        case "yearly":
          return `${dateInfo.year}`;
        default:
          return `${months[dateInfo.month - 1]} ${dateInfo.year}`;
      }
    };

    const formattedTimeSeries = analyticsData[0]?.timeSeriesData
      .map((d) => ({
        label: formatLabel(d.dateInfo, period),
        revenue: d.revenue,
      }))
      .reverse();

    const stats = {
      totalRevenue: analyticsData[0]?.totalStats[0]?.totalRevenue || 0,
      totalSales: analyticsData[0]?.totalStats[0]?.totalSales || 0,
      totalStudents,
      totalCourses,
      timeSeriesData: formattedTimeSeries || [],
      topCourses: analyticsData[0]?.topCourses || [],
    };
    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.log("Error in getInstructorAnalytics: ", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getQuizAttemptsForCourse = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });
    }

    if (course.creator.toString() !== userId && user.role !== "superadmin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not authorized to view these results.",
        });
    }

    const attempts = await QuizAttempt.find({ course: courseId })
      .populate({ path: "student", select: "name email" })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, attempts });
  } catch (error) {
    console.log("Error fetching quiz attempts:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getStudentProgress = async (req, res) => {
  try {
    const instructorId = req.id;
    const { courseId, studentId } = req.params;

    const course = await Course.findById(courseId);
    if (!course || course.creator.toString() !== instructorId) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to view this course's progress.",
        });
    }

    if (course.lectures.length === 0) {
      return res.status(200).json({ success: true, progress: 0 });
    }
    const totalLectures = course.lectures.length;
    const progressData = await CourseProgress.findOne({
      userId: studentId,
      courseId,
    });
    if (!progressData) {
      return res.status(200).json({ success: true, progress: 0 });
    }
    const viewedLectures = progressData.lectureProgress.filter(
      (p) => p.viewed
    ).length;
    const percentage = Math.round((viewedLectures / totalLectures) * 100);

    res.status(200).json({ success: true, progress: percentage });
  } catch (error) {
    console.log("Error fetching student progress for instructor:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getInstructorFinancials = async (req, res) => {
  try {
    const instructorId = new mongoose.Types.ObjectId(req.id);
    const { period = "all" } = req.query;

    let dateFilter = {};
    if (period !== "all") {
      let startDate = new Date();
      switch (period) {
        case "daily":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "weekly":
          startDate.setDate(startDate.getDate() - 7 * 12);
          break;
        case "monthly":
          startDate.setMonth(startDate.getMonth() - 12);
          break;
        case "yearly":
          startDate.setFullYear(startDate.getFullYear() - 5);
          break;
      }
      dateFilter = { createdAt: { $gte: startDate } };
    }

    const courseSales = await CoursePurchase.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      {
        $match: {
          "course.creator": instructorId,
          status: "completed",
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: "$courseId",
          courseTitle: { $first: "$course.courseTitle" },
          totalRevenue: { $sum: "$amount" },
          totalPlatformFee: { $sum: "$platformFee" },
          netIncome: { $sum: "$instructorRevenue" },
          totalSales: { $sum: 1 },
        },
      },
      { $sort: { netIncome: -1 } },
    ]);

    const payouts = await Payout.aggregate([
      { $match: { instructor: instructorId, ...dateFilter } },
      {
        $group: {
          _id: "$status",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalEarned = courseSales.reduce(
      (acc, course) => acc + course.netIncome,
      0
    );
    const totalPaidOut =
      payouts.find((p) => p._id === "completed")?.totalAmount || 0;

    res.status(200).json({
      success: true,
      financials: {
        courseSales,
        payouts,
        summary: {
          totalEarned,
          totalPaidOut,
          platformFees: courseSales.reduce(
            (acc, course) => acc + course.totalPlatformFee,
            0
          ),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching instructor financials:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getInstructorFinancialsReport = async (req, res) => {
  try {
    const instructorId = new mongoose.Types.ObjectId(req.id);
    const { period = "all", format = "pdf" } = req.query;

    let dateFilter = {};
    let periodLabel = "All Time";
    if (period !== "all") {
      let startDate = new Date();
      switch (period) {
        case "daily":
          startDate.setDate(startDate.getDate() - 30);
          periodLabel = "Last 30 Days";
          break;
        case "weekly":
          startDate.setDate(startDate.getDate() - 7 * 12);
          periodLabel = "Last 12 Weeks";
          break;
        case "monthly":
          startDate.setMonth(startDate.getMonth() - 12);
          periodLabel = "Last 12 Months";
          break;
        case "yearly":
          startDate.setFullYear(startDate.getFullYear() - 5);
          periodLabel = "Last 5 Years";
          break;
      }
      dateFilter = { createdAt: { $gte: startDate } };
    }

    const instructor = await User.findById(instructorId).select("name email");
    if (!instructor) {
      return res
        .status(404)
        .json({ success: false, message: "Instructor not found." });
    }

    const courseSales = await CoursePurchase.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      {
        $match: {
          "course.creator": instructorId,
          status: "completed",
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: "$courseId",
          courseTitle: { $first: "$course.courseTitle" },
          totalRevenue: { $sum: "$amount" },
          totalPlatformFee: { $sum: "$platformFee" },
          netIncome: { $sum: "$instructorRevenue" },
          totalSales: { $sum: 1 },
        },
      },
      { $sort: { netIncome: -1 } },
    ]);

    const payouts = await Payout.aggregate([
      { $match: { instructor: instructorId, ...dateFilter } },
      {
        $group: {
          _id: "$status",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalEarned = courseSales.reduce(
      (acc, course) => acc + course.netIncome,
      0
    );
    const totalPaidOut =
      payouts.find((p) => p._id === "completed")?.totalAmount || 0;
    const totalPlatformFees = courseSales.reduce(
      (acc, course) => acc + course.totalPlatformFee,
      0
    );

    const reportData = {
      instructorName: instructor.name,
      instructorEmail: instructor.email,
      period: periodLabel,
      summary: {
        totalEarned,
        totalPaidOut,
        totalPlatformFees,
        pendingPayouts:
          payouts.find((p) => p._id === "pending")?.totalAmount || 0,
      },
      courseSales,
      payouts: payouts.map((p) => ({
        status: p._id,
        totalAmount: p.totalAmount,
        count: p.count,
      })),
    };

    if (format === "pdf") {
      const { generateInstructorFinancialsPdf } = await import(
        "../utils/generateReports.js"
      );
      const pdfBuffer = await generateInstructorFinancialsPdf(reportData);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=instructor_financial_report_${period}.pdf`
      );
      res.send(pdfBuffer);
    } else if (format === "csv") {
      const { generateInstructorFinancialsCsv } = await import(
        "../utils/generateReports.js"
      );
      const csvString = generateInstructorFinancialsCsv(reportData);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=instructor_financial_report_${period}.csv`
      );
      res.send(csvString);
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid report format." });
    }
  } catch (error) {
    console.error("Error generating instructor financials report:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to generate report." });
  }
};

export {
  getEnrolledStudentsForInstructor,
  getInstructorAnalytics,
  getQuizAttemptsForCourse,
  getStudentProgress,
  getInstructorFinancials,
  getInstructorFinancialsReport,
};
