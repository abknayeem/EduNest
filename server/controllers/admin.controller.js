import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Category } from "../models/category.model.js";
import { Lecture } from "../models/lecture.model.js";
import { QuizAttempt } from "../models/quizAttempt.model.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  deleteMediaFromCloudinary,
  deleteVideoFromCloudinary,
} from "../utils/cloudinary.js";
import sendEmail from "../utils/sendEmail.js";

export const getPlatformStats = async (req, res) => {
  try {
    const totalInstructors = await User.countDocuments({ role: "instructor" });
    const totalStudents = await User.countDocuments({ role: "student" });

    const salesData = await CoursePurchase.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalSales: { $sum: 1 },
        },
      },
    ]);
    const stats = {
      totalInstructors,
      totalStudents,
      totalRevenue: salesData.length > 0 ? salesData[0].totalRevenue : 0,
      totalSales: salesData.length > 0 ? salesData[0].totalSales : 0,
    };
    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getAllInstructors = async (req, res) => {
  try {
    const instructorsWithStats = await User.aggregate([
      { $match: { role: "instructor" } },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "creator",
          as: "courses",
        },
      },
      {
        $lookup: {
          from: "coursepurchases",
          localField: "courses._id",
          foreignField: "courseId",
          as: "purchases",
        },
      },
      {
        $addFields: {
          courseCount: { $size: "$courses" },
          totalStudents: {
            $reduce: {
              input: "$courses",
              initialValue: 0,
              in: { $add: ["$$value", { $size: "$$this.enrolledStudents" }] },
            },
          },
          totalRevenue: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$purchases",
                    as: "purchase",
                    cond: { $eq: ["$$purchase.status", "completed"] },
                  },
                },
                as: "purchase",
                in: "$$purchase.amount",
              },
            },
          },
        },
      },
      {
        $project: {
          password: 0,
          courses: 0,
          purchases: 0,
        },
      },
    ]);

    res.status(200).json({ success: true, instructors: instructorsWithStats });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getInstructorDetails = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const instructor = await User.findById(instructorId).select("-password");
    if (!instructor || instructor.role !== "instructor") {
      return res
        .status(404)
        .json({ success: false, message: "Instructor not found." });
    }

    const courses = await Course.find({ creator: instructorId }).sort({
      createdAt: -1,
    });

    const courseIds = courses.map((c) => c._id);
    const purchases = await CoursePurchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    });

    const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);
    const totalStudents = courses.reduce(
      (sum, c) => sum + c.enrolledStudents.length,
      0
    );

    res.status(200).json({
      success: true,
      details: {
        instructor: instructor.toObject(),
        courses,
        totalRevenue,
        totalStudents,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getUserDetailsForAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "enrolledCourses",
        populate: {
          path: "creator",
          select: "name photoUrl",
        },
      });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!role || !["student", "instructor"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role specified." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    let emailHtml;
    let subject;

    if (role === "instructor" && user.role === "student") {
      subject = "Congratulations! You are now an Instructor on EduNest";
      emailHtml = `<p>Hi ${user.name},</p><p>We are excited to inform you that your role has been upgraded to <strong>Instructor</strong> on EduNest!</p><p>You can now access your instructor dashboard to create and manage your courses.</p><p>Welcome to our community of educators!</p><p>The EduNest Team</p>`;
    } else if (role === "student" && user.role === "instructor") {
      subject = "Update on Your EduNest Account Role";
      emailHtml = `<p>Hi ${user.name},</p><p>This is to inform you that your account role on EduNest has been updated to <strong>Student</strong>.</p><p>You will no longer have access to the instructor dashboard. If you believe this is a mistake, please contact our support team.</p><p>Thank you,</p><p>The EduNest Team</p>`;
    }

    user.role = role;
    if (role === "instructor") {
      user.instructorApplicationStatus = "approved";
    } else {
      user.instructorApplicationStatus = "none";
    }
    await user.save();

    if (emailHtml && subject) {
      try {
        await sendEmail({ email: user.email, subject, html: emailHtml });
      } catch (emailError) {
        console.error(
          `Failed to send role change email to ${user.email}:`,
          emailError
        );
      }
    }

    res
      .status(200)
      .json({ success: true, message: `User role updated to ${role}.` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }
    if (!["student", "instructor"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role specified." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({
          success: false,
          message: "User with this email already exists.",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: true,
    });

    try {
      const emailHtml = `<p>Hi ${name},</p><p>A new account has been created for you on EduNest by an administrator.</p><p>You can now log in using the following credentials:</p><ul><li><strong>Email:</strong> ${email}</li><li><strong>Password:</strong> ${password}</li></ul><p>For your security, we strongly recommend that you change your password after your first login.</p><p>Welcome to the community!</p><p>The EduNest Team</p>`;
      await sendEmail({
        email: newUser.email,
        subject: "Welcome to EduNest! Your Account Has Been Created",
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Failed to send account creation email:", emailError);
      return res
        .status(201)
        .json({
          success: true,
          message:
            "User created successfully, but the confirmation email could not be sent.",
        });
    }

    res
      .status(201)
      .json({
        success: true,
        message: "User created successfully and a welcome email has been sent.",
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    if (user.role === "superadmin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Superadmin accounts cannot be deleted.",
        });
    }
    await User.findByIdAndDelete(userId);
    try {
      const emailHtml = `<p>Hi ${user.name},</p><p>This is a notification to inform you that your account on EduNest has been permanently deleted by an administrator.</p><p>This action is irreversible. If you believe this was done in error or have any questions, please contact our support team at <strong>operations@edunest.com</strong>.</p><p>Thank you,</p><p>The EduNest Team</p>`;
      await sendEmail({
        email: user.email,
        subject: "Important: Your EduNest Account Has Been Deleted",
        html: emailHtml,
      });
    } catch (emailError) {
      console.error(
        `Failed to send deletion email to ${user.email}:`,
        emailError
      );
    }
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    console.log("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getAllCoursesForAdmin = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate({ path: "creator", select: "name" })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, courses });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateCoursePublicationStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { isPublished } = req.body;

    if (typeof isPublished !== "boolean") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid publication status." });
    }
    const course = await Course.findById(courseId).populate("creator");
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });
    }
    course.isPublished = isPublished;
    await course.save();
    if (course.isPublished) {
      try {
        const instructor = course.creator;
        const emailHtml = `<p>Hi ${instructor.name},</p><p>Great news! An administrator has reviewed and published your course, "<strong>${course.courseTitle}</strong>". It is now live on the EduNest platform.</p><p>You can view your published course here:</p><a href="${process.env.FRONTEND_URL}/course-detail/${course._id}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;">View Your Course</a>`;
        await sendEmail({
          email: instructor.email,
          subject: "Your Course Has Been Published by an Admin",
          html: emailHtml,
        });
      } catch (emailError) {
        console.error("Failed to send admin course publish email:", emailError);
      }
    }
    res
      .status(200)
      .json({
        success: true,
        message: `Course has been ${
          isPublished ? "published" : "unpublished"
        }.`,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getCategoryStats = async (req, res) => {
  try {
    const categories = await Category.find();
    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const courses = await Course.find({ category: category.name });
        const courseIds = courses.map((c) => c._id);
        const totalCourses = courses.length;
        const publishedCourses = courses.filter((c) => c.isPublished).length;
        const purchases = await CoursePurchase.find({
          courseId: { $in: courseIds },
          status: "completed",
        });
        const totalRevenue = purchases.reduce(
          (sum, purchase) => sum + purchase.amount,
          0
        );
        return {
          _id: category._id,
          name: category.name,
          totalCourses,
          publishedCourses,
          totalRevenue,
          createdAt: category.createdAt,
        };
      })
    );
    res.status(200).json({ success: true, categoryStats });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getPlatformAnalytics = async (req, res) => {
  try {
    const { period = "monthly", categoryPeriod = "all" } = req.query;
    let mainDateFilter = {};
    let groupUnit = {};
    let timeSeriesLimit = 12;
    let sortOrder = { "_id.year": -1, "_id.month": -1 };
    switch (period) {
      case "daily":
        mainDateFilter = {
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
        mainDateFilter = {
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
        mainDateFilter = {
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
    let categoryDateFilter = {};
    if (categoryPeriod !== "all") {
      let date = new Date();
      switch (categoryPeriod) {
        case "yearly":
          date.setFullYear(date.getFullYear() - 1);
          break;
        case "monthly":
          date.setMonth(date.getMonth() - 1);
          break;
        case "weekly":
          date.setDate(date.getDate() - 7);
          break;
      }
      categoryDateFilter = { createdAt: { $gte: date } };
    }
    const analyticsData = await CoursePurchase.aggregate([
      {
        $facet: {
          timeSeriesData: [
            { $match: { status: "completed", ...mainDateFilter } },
            { $group: { _id: groupUnit, revenue: { $sum: "$amount" } } },
            { $sort: sortOrder },
            { $limit: timeSeriesLimit },
            { $project: { _id: 0, dateInfo: "$_id", revenue: "$revenue" } },
          ],
          topInstructors: [
            { $match: { status: "completed", ...mainDateFilter } },
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
              $group: {
                _id: "$course.creator",
                totalRevenue: { $sum: "$amount" },
              },
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "instructor",
              },
            },
            { $unwind: "$instructor" },
            {
              $project: {
                _id: 1,
                name: "$instructor.name",
                revenue: "$totalRevenue",
              },
            },
          ],
          categoryRevenue: [
            { $match: { status: "completed", ...categoryDateFilter } },
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
              $group: { _id: "$course.category", revenue: { $sum: "$amount" } },
            },
            { $sort: { revenue: -1 } },
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
    const formattedTimeSeries = (analyticsData[0]?.timeSeriesData || [])
      .map((d) => ({
        label: formatLabel(d.dateInfo, period),
        revenue: d.revenue,
      }))
      .reverse();
    const stats = {
      timeSeriesData: formattedTimeSeries,
      topInstructors: analyticsData[0]?.topInstructors || [],
      categoryRevenue: analyticsData[0]?.categoryRevenue || [],
    };
    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.log("Error in getPlatformAnalytics: ", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isDisabled } = req.body;
    if (typeof isDisabled !== "boolean") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status provided." });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    if (user.role === "superadmin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Cannot change the status of a superadmin.",
        });
    }
    user.isDisabled = isDisabled;
    await user.save();
    try {
      let emailHtml, subject;
      if (isDisabled) {
        subject = "Important: Your EduNest Account Has Been Disabled";
        emailHtml = `<p>Hi ${user.name},</p><p>We are writing to inform you that your account on EduNest has been temporarily disabled due to a violation of our platform policies.</p><p>If you believe this is a mistake or wish to appeal this decision, please contact our support team at <strong>operations@edunest.com</strong> as soon as possible.</p><p>Thank you,</p><p>The EduNest Team</p>`;
      } else {
        subject = "Your EduNest Account Has Been Re-enabled";
        emailHtml = `<p>Hi ${user.name},</p><p>We are pleased to inform you that your account on EduNest has been re-enabled. You can now log in and continue your learning journey.</p><p>If you have any questions, please don't hesitate to contact our support team.</p><p>Welcome back!</p><p>The EduNest Team</p>`;
      }
      await sendEmail({ email: user.email, subject: subject, html: emailHtml });
    } catch (emailError) {
      console.error(
        `Failed to send account ${isDisabled ? "disabled" : "enabled"} email:`,
        emailError
      );
    }
    res
      .status(200)
      .json({
        success: true,
        message: `User has been ${isDisabled ? "disabled" : "enabled"}.`,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getInstructorMonthlySales = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { year } = req.query;
    if (!year) {
      return res
        .status(400)
        .json({ success: false, message: "Year is required." });
    }
    const instructorCourses = await Course.find({
      creator: instructorId,
    }).select("_id");
    const courseIds = instructorCourses.map((c) => c._id);
    const sales = await CoursePurchase.aggregate([
      {
        $match: {
          courseId: { $in: courseIds },
          status: "completed",
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lt: new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`),
          },
        },
      },
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
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            course: "$course.courseTitle",
            createdAt: "$course.createdAt",
          },
          revenue: { $sum: "$amount" },
          sales: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.month",
          monthlyRevenue: { $sum: "$revenue" },
          coursesSold: {
            $push: {
              title: "$_id.course",
              revenue: "$revenue",
              sales: "$sales",
              createdAt: "$_id.createdAt",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: "$_id",
          revenue: "$monthlyRevenue",
          courses: "$coursesSold",
        },
      },
    ]);
    res.status(200).json({ success: true, sales });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.role !== "instructor") {
      return res
        .status(404)
        .json({ success: false, message: "Instructor not found." });
    }
    const courses = await Course.find({ creator: instructorId });
    const courseIds = courses.map((c) => c._id);
    for (const course of courses) {
      if (course.courseThumbnail) {
        const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId);
      }
      const lectures = await Lecture.find({ _id: { $in: course.lectures } });
      for (const lecture of lectures) {
        if (lecture.publicId) {
          await deleteVideoFromCloudinary(lecture.publicId);
        }
      }
      await Lecture.deleteMany({ _id: { $in: course.lectures } });
    }
    await Course.deleteMany({ creator: instructorId });
    await CoursePurchase.deleteMany({ courseId: { $in: courseIds } });
    await User.findByIdAndDelete(instructorId);
    res
      .status(200)
      .json({
        success: true,
        message: "Instructor and all their data deleted successfully.",
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getAllTransactions = async (req, res) => {
  try {
    const { month, year } = req.query;
    let dateFilter = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      dateFilter.createdAt = { $gte: startDate, $lte: endDate };
    }
    const transactions = await CoursePurchase.find(dateFilter)
      .populate({
        path: "courseId",
        select: "courseTitle creator",
        populate: { path: "creator", select: "name" },
      })
      .populate({ path: "userId", select: "name email" })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, transactions });
  } catch (error) {
    console.log("Error fetching transactions:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getPendingRequestsCount = async (req, res) => {
  try {
    const count = await User.countDocuments({
      instructorApplicationStatus: "pending",
    });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.log("Error fetching pending requests count:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const refuseInstructorRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    if (user.instructorApplicationStatus !== "pending") {
      return res
        .status(400)
        .json({
          success: false,
          message: "User does not have a pending application.",
        });
    }
    user.instructorApplicationStatus = "none";
    await user.save();
    try {
      const emailHtml = `<p>Hi ${user.name},</p><p>Thank you for your interest in becoming an instructor at EduNest.</p><p>After reviewing your application, we have decided not to proceed at this time. We encourage you to continue learning with us and welcome you to apply again in the future once you have further developed your profile and course ideas.</p><p>Best regards,</p><p>The EduNest Team</p>`;
      await sendEmail({
        email: user.email,
        subject: "Update on Your EduNest Instructor Application",
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Failed to send refusal email:", emailError);
    }
    res
      .status(200)
      .json({
        success: true,
        message:
          "Instructor application has been refused and the user has been notified.",
      });
  } catch (error) {
    console.log("Error refusing instructor request:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getQuizAttempts = async (req, res) => {
  try {
    const { studentId } = req.query;
    let filter = {};

    if (studentId) {
      filter.student = studentId;
    }

    const attempts = await QuizAttempt.find(filter)
      .populate({ path: "course", select: "courseTitle" })
      .populate({ path: "student", select: "name" })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, attempts });
  } catch (error) {
    console.log("Error fetching quiz attempts for admin:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
