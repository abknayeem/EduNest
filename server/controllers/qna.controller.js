import { Question } from "../models/qna.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";

export const getQuestionsForLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const questions = await Question.find({ lecture: lectureId })
      .populate("user", "name photoUrl")
      .populate("answers.user", "name photoUrl role")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, questions });
  } catch (error) {
    console.error("Error fetching questions for lecture:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getQuestionsForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });
    }

    const user = await User.findById(userId);
    if (course.creator.toString() !== userId && user.role !== "superadmin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not authorized to view these questions.",
        });
    }

    const questions = await Question.find({ course: courseId })
      .populate("user", "name photoUrl")
      .populate("answers.user", "name photoUrl role")
      .populate("lecture", "lectureTitle")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, questions });
  } catch (error) {
    console.error("Error fetching questions for course:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const postQuestion = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { title, content, courseId } = req.body;
    const userId = req.id;

    if (!title || !courseId) {
      return res
        .status(400)
        .json({ success: false, message: "Title and courseId are required." });
    }

    const question = await Question.create({
      title,
      content,
      user: userId,
      lecture: lectureId,
      course: courseId,
    });

    try {
      const course = await Course.findById(courseId).populate("creator");
      const student = await User.findById(userId);
      const instructor = course.creator;

      const emailHtml = `
                <p>Hi ${instructor.name},</p>
                <p>A new question has been asked in your course "<strong>${
                  course.courseTitle
                }</strong>".</p>
                <p><strong>Student:</strong> ${student.name}</p>
                <p><strong>Question:</strong> ${title}</p>
                <p>${content || ""}</p>
                <p>You can answer this question by visiting your Q&A management page:</p>
                <a href="${
                  process.env.FRONTEND_URL
                }/admin/course/${courseId}/qna">Answer Now</a>
            `;

      await sendEmail({
        email: instructor.email,
        subject: `New Question in your course: ${course.courseTitle}`,
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Failed to send question notification email:", emailError);
    }

    res
      .status(201)
      .json({
        success: true,
        message: "Question posted successfully.",
        question,
      });
  } catch (error) {
    console.error("Error posting question:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to post question." });
  }
};

export const postAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { content } = req.body;
    const userId = req.id;

    if (!content) {
      return res
        .status(400)
        .json({ success: false, message: "Answer content cannot be empty." });
    }

    let question = await Question.findById(questionId).populate("course");
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found." });
    }

    question.answers.push({ content, user: userId });
    await question.save();

    try {
      const questionAuthor = await User.findById(question.user);
      const answerAuthor = await User.findById(userId);

      if (questionAuthor._id.toString() !== answerAuthor._id.toString()) {
        const emailHtml = `
                    <p>Hi ${questionAuthor.name},</p>
                    <p>You have a new answer to your question in the course "<strong>${question.course.courseTitle}</strong>".</p>
                    <p><strong>Your Question:</strong> ${question.title}</p>
                    <p><strong>${answerAuthor.name}'s Answer:</strong> ${content}</p>
                    <p>You can view the full discussion here:</p>
                    <a href="${process.env.FRONTEND_URL}/course-progress/${question.course._id}">View Answer</a>
                `;

        await sendEmail({
          email: questionAuthor.email,
          subject: `New Answer to your question in ${question.course.courseTitle}`,
          html: emailHtml,
        });
      }
    } catch (emailError) {
      console.error("Failed to send answer notification email:", emailError);
    }

    await question.populate("answers.user", "name photoUrl role");
    const newAnswer = question.answers[question.answers.length - 1];

    res
      .status(201)
      .json({
        success: true,
        message: "Answer posted successfully.",
        answer: newAnswer,
      });
  } catch (error) {
    console.error("Error posting answer:", error);
    res.status(500).json({ success: false, message: "Failed to post answer." });
  }
};

export const updateAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;
    const { content } = req.body;
    const userId = req.id;

    if (!content) {
      return res
        .status(400)
        .json({ success: false, message: "Content is required." });
    }

    const question = await Question.findOne({ "answers._id": answerId });
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Answer not found." });
    }

    const answer = question.answers.id(answerId);
    const user = await User.findById(userId);

    if (answer.user.toString() !== userId && user.role !== "superadmin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to edit this answer.",
        });
    }

    answer.content = content;
    await question.save();

    await question.populate("answers.user", "name photoUrl role");

    res
      .status(200)
      .json({ success: true, message: "Answer updated.", question });
  } catch (error) {
    console.error("Error updating answer:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;
    const userId = req.id;

    const question = await Question.findOne({ "answers._id": answerId });
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Answer not found." });
    }

    const answer = question.answers.id(answerId);
    const user = await User.findById(userId);

    if (answer.user.toString() !== userId && user.role !== "superadmin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete this answer.",
        });
    }

    question.answers.pull({ _id: answerId });
    await question.save();

    res.status(200).json({ success: true, message: "Answer deleted." });
  } catch (error) {
    console.error("Error deleting answer:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
