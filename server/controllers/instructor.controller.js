import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { QuizAttempt } from "../models/quizAttempt.model.js";
import mongoose from "mongoose";

export const getEnrolledStudentsForInstructor = async (req, res) => {
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

export const getInstructorAnalytics = async (req, res) => {
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
        dateFilter = { createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) } };
        groupUnit = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } };
        sortOrder = { "_id.year": -1, "_id.month": -1, "_id.day": -1 };
        timeSeriesLimit = 30;
        break;
      case "weekly":
        dateFilter = { createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 84)) } };
        groupUnit = { year: { $isoWeekYear: "$createdAt" }, week: { $isoWeek: "$createdAt" } };
        sortOrder = { "_id.year": -1, "_id.week": -1 };
        timeSeriesLimit = 12;
        break;
      case "yearly":
        groupUnit = { year: { $year: "$createdAt" } };
        sortOrder = { "_id.year": -1 };
        timeSeriesLimit = 5;
        break;
      default:
        dateFilter = { createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) } };
        groupUnit = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
        sortOrder = { "_id.year": -1, "_id.month": -1 };
        timeSeriesLimit = 12;
        break;
    }

    const analyticsData = await CoursePurchase.aggregate([
      { $match: { courseId: { $in: courseIds }, status: "completed", ...dateFilter } },
      {
        $facet: {
          totalStats: [ { $group: { _id: null, totalRevenue: { $sum: "$amount" }, totalSales: { $sum: 1 } } } ],
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
            { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "courseInfo" } },
            { $unwind: "$courseInfo" },
            { $project: { _id: 1, title: "$courseInfo.courseTitle", revenue: 1 } },
          ],
        },
      },
    ]);

    const formatLabel = (dateInfo, period) => {
      const months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
      switch (period) {
        case "daily": return `${dateInfo.day}/${months[dateInfo.month - 1]}`;
        case "weekly": return `W${dateInfo.week}, ${dateInfo.year}`;
        case "yearly": return `${dateInfo.year}`;
        default: return `${months[dateInfo.month - 1]} ${dateInfo.year}`;
      }
    };

    const formattedTimeSeries = analyticsData[0]?.timeSeriesData.map((d) => ({
        label: formatLabel(d.dateInfo, period),
        revenue: d.revenue,
    })).reverse();

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

export const getQuizAttemptsForCourse = async (req, res) => {
  try {
    const instructorId = req.id;
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course || course.creator.toString() !== instructorId) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const attempts = await QuizAttempt.find({ course: courseId })
      .populate({
        path: "student",
        select: "name email",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, attempts });
  } catch (error) {
    console.log("Error fetching quiz attempts:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};