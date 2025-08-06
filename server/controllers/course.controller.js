import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";
import {
  deleteMediaFromCloudinary,
  deleteVideoFromCloudinary,
  uploadMedia,
} from "../utils/cloudinary.js";
import sendEmail from "../utils/sendEmail.js";

const isOwnerOrSuperadmin = async (userId, courseId) => {
  const user = await User.findById(userId);
  if (!user) return false;
  if (user.role === "superadmin") return true;

  const course = await Course.findById(courseId);
  if (!course) return false;

  return course.creator.toString() === userId;
};

export const createCourse = async (req, res) => {
  try {
    const { courseTitle, category } = req.body;
    if (!courseTitle || !category) {
      return res.status(400).json({
        message: "Course Title and Category are Required",
      });
    }

    const course = await Course.create({
      courseTitle,
      category,
      creator: req.id,
    });
    return res.status(201).json({
      course,
      message: "Course Created Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to Create Course",
    });
  }
};

export const searchCourse = async (req, res) => {
  try {
    const { query = "", categories = [], sortByPrice = "" } = req.query;
    const searchCriteria = {
      isPublished: true,
      $or: [
        { courseTitle: { $regex: query, $options: "i" } },
        { subTitle: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    };

    if (categories.length > 0) {
      searchCriteria.category = { $in: categories };
    }

    const sortOptions = {};
    if (sortByPrice === "low") {
      sortOptions.coursePrice = 1;
    } else if (sortByPrice === "high") {
      sortOptions.coursePrice = -1;
    }

    let courses = await Course.find(searchCriteria)
      .populate({ path: "creator", select: "name photoUrl" })
      .sort(sortOptions);
    return res.status(200).json({
      success: true,
      courses: courses || [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to search courses" });
  }
};

export const getPublishedCourse = async (_, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).populate({
      path: "creator",
      select: "name photoUrl",
    });
    if (!courses) {
      return res.status(404).json({
        message: "Course not Found",
      });
    }
    return res.status(200).json({
      courses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to Get Published Courses",
    });
  }
};

export const getCreatorCourses = async (req, res) => {
  try {
    const user = await User.findById(req.id);
    let courses;

    if (user.role === "superadmin") {
      courses = await Course.find({}).sort({ createdAt: -1 });
    } else {
      courses = await Course.find({ creator: req.id }).sort({ createdAt: -1 });
    }

    if (!courses) {
      return res.status(404).json({
        courses: [],
        message: "Courses not Found",
      });
    }
    return res.status(200).json({
      courses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get courses",
    });
  }
};

export const editCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const authorized = await isOwnerOrSuperadmin(req.id, courseId);
    if (!authorized) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this course." });
    }

    const {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
    } = req.body;
    const thumbnail = req.file;

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not Found!" });
    }

    let courseThumbnail;
    if (thumbnail) {
      if (course.courseThumbnail) {
        const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId);
      }
      courseThumbnail = await uploadMedia(thumbnail.path);
    }

    const updateData = {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
    };
    if (courseThumbnail?.secure_url) {
      updateData.courseThumbnail = courseThumbnail.secure_url;
    }

    course = await Course.findByIdAndUpdate(courseId, updateData, {
      new: true,
    });

    return res
      .status(200)
      .json({ course, message: "Course Updated Successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to update Course" });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not Found!",
      });
    }
    return res.status(200).json({
      course,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to Get Course by ID",
    });
  }
};

export const createLecture = async (req, res) => {
  try {
    const { lectureTitle } = req.body;
    const { courseId } = req.params;

    const authorized = await isOwnerOrSuperadmin(req.id, courseId);
    if (!authorized) {
      return res
        .status(403)
        .json({ message: "Not authorized to add lectures to this course." });
    }

    if (!lectureTitle) {
      return res.status(400).json({ message: "Lecture Title is Required" });
    }
    const lecture = await Lecture.create({ lectureTitle });
    await Course.findByIdAndUpdate(courseId, {
      $push: { lectures: lecture._id },
    });

    return res
      .status(201)
      .json({ lecture, message: "Lecture Created Successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to Create Lecture" });
  }
};

export const getCourseLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate("lectures");
    if (!course) {
      return res.status(404).json({
        message: "Course not Found",
      });
    }
    return res.status(200).json({
      lectures: course.lectures,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to Get Lectures",
    });
  }
};

export const editLecture = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;

    const authorized = await isOwnerOrSuperadmin(req.id, courseId);
    if (!authorized) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit lectures for this course." });
    }

    const { lectureTitle, videoInfo, isPreviewFree } = req.body;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found!" });
    }

    if (lectureTitle) lecture.lectureTitle = lectureTitle;
    if (videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
    if (videoInfo?.publicId) lecture.publicId = videoInfo.publicId;
    lecture.isPreviewFree = isPreviewFree;

    await lecture.save();
    return res
      .status(200)
      .json({ lecture, message: "Lecture Updated Successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to Edit Lectures" });
  }
};

export const removeLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findByIdAndDelete(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not Found!" });
    }

    if (lecture.publicId) {
      await deleteVideoFromCloudinary(lecture.publicId);
    }

    await Course.updateMany(
      { lectures: lectureId },
      { $pull: { lectures: lectureId } }
    );
    return res.status(200).json({ message: "Lecture Removed Successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to Remove Lecture" });
  }
};

export const getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not Found!" });
    }
    return res.status(200).json({ lecture });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to Get Lecture by ID" });
  }
};

export const togglePublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { publish } = req.query;
    const course = await Course.findById(courseId).populate("creator");
    if (!course) {
      return res.status(404).json({ message: "Course not Found!" });
    }

    if (publish === "true" && course.creator.isDisabled) {
      return res.status(403).json({
        success: false,
        message: "This instructor is disabled and cannot publish courses.",
      });
    }

    course.isPublished = publish === "true";
    if (course.isPublished) {
      course.publishedAt = new Date();
    } else {
      course.publishedAt = null;
    }
    await course.save();

    if (course.isPublished) {
      try {
        const emailHtml = `<p>Hi ${course.creator.name},</p><p>Congratulations! Your course, "<strong>${course.courseTitle}</strong>", has been successfully published and is now live on EduNest.</p><p>You can view your published course here:</p><a href="${process.env.FRONTEND_URL}/course-detail/${course._id}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;">View Your Course</a>`;
        await sendEmail({
          email: course.creator.email,
          subject: "Your Course is Now Live on EduNest!",
          html: emailHtml,
        });
      } catch (emailError) {
        console.error("Failed to send course publish email:", emailError);
      }
    }

    const statusMessage = course.isPublished ? "Published" : "Unpublished";
    return res.status(200).json({ message: `Course is ${statusMessage}` });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to Update Status" });
  }
};

export const requestCourseDeletion = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });
    }
    if (course.creator.toString() !== req.id) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not authorized to perform this action.",
        });
    }
    course.isDeletionRequested = true;
    await course.save();
    return res
      .status(200)
      .json({
        success: true,
        message: "Deletion request submitted. An admin will review it shortly.",
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to request course deletion." });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate("creator");
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });
    }
    const user = await User.findById(req.id);
    if (user.role !== "superadmin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not authorized to delete this course.",
        });
    }
    try {
      const instructor = course.creator;
      const emailHtml = `<p>Hi ${instructor.name},</p><p>We are writing to inform you that your course, "<strong>${course.courseTitle}</strong>", has been removed from the EduNest platform by an administrator.</p><p>If you have any questions or believe this was done in error, please contact our support team.</p><p>The EduNest Team</p>`;
      await sendEmail({
        email: instructor.email,
        subject: "Important: Your Course Has Been Removed from EduNest",
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Failed to send course deletion email:", emailError);
    }
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
    await User.updateMany(
      { _id: { $in: course.enrolledStudents } },
      { $pull: { enrolledCourses: courseId } }
    );
    await Course.findByIdAndDelete(courseId);
    return res
      .status(200)
      .json({
        success: true,
        message: "Course and all its assets have been deleted successfully.",
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete course." });
  }
};
