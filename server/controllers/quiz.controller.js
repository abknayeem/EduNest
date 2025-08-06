import { Quiz } from "../models/quiz.model.js";
import { Course } from "../models/course.model.js";
import { QuizAttempt } from "../models/quizAttempt.model.js";
import { User } from "../models/user.model.js";

export const saveQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, questions, timeLimit, passingScore } = req.body;
    const user = await User.findById(req.id);

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }
    
    if (course.creator.toString() !== req.id && user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: "You are not authorized to edit this course's quiz." });
    }

    const quizData = {
      course: courseId,
      creator: course.creator,
      title,
      questions,
      timeLimit,
      passingScore,
    };

    const quiz = await Quiz.findOneAndUpdate({ course: courseId }, quizData, {
      new: true,
      upsert: true,
      runValidators: true,
    });
    
    if (!course.quiz) {
        course.quiz = quiz._id;
        await course.save();
    }

    res.status(200).json({ success: true, message: "Quiz saved successfully.", quiz });
  } catch (error) {
    console.error("Error saving quiz:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getQuizByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const quiz = await Quiz.findOne({ course: courseId });

        if (!quiz) {
            return res.status(200).json({ success: true, quiz: null });
        }
        res.status(200).json({ success: true, quiz });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getQuizForStudent = async (req, res) => {
    try {
        const { courseId } = req.params;
        const quiz = await Quiz.findOne({ course: courseId }).select("-questions.correctAnswer");
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found for this course." });
        }
        res.status(200).json({ success: true, quiz });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const submitQuiz = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.id;
        const { answers } = req.body;

        const quiz = await Quiz.findOne({ course: courseId });
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found." });
        }

        let score = 0;
        const detailedAnswers = quiz.questions.map(question => {
            const correctAnswer = question.correctAnswer;
            const selectedAnswer = answers[question._id] || "";
            const isCorrect = selectedAnswer === correctAnswer;
            if (isCorrect) score++;
            return { questionId: question._id, questionText: question.questionText, selectedAnswer, correctAnswer, isCorrect };
        });
        
        const percentage = (score / quiz.questions.length) * 100;
        const passed = percentage >= quiz.passingScore;

        const attempt = await QuizAttempt.create({
            quiz: quiz._id,
            course: courseId,
            student: studentId,
            score,
            totalQuestions: quiz.questions.length,
            answers: detailedAnswers,
            passed: passed,
        });

        res.status(201).json({ success: true, message: "Quiz submitted!", attemptId: attempt._id });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getQuizResult = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const user = await User.findById(req.id);
        const attempt = await QuizAttempt.findById(attemptId);
        if (!attempt) {
            return res.status(404).json({ success: false, message: "Quiz attempt not found." });
        }

        if (attempt.student.toString() !== req.id && user.role !== 'superadmin') {
            return res.status(403).json({ success: false, message: "Not authorized." });
        }
        
        const course = await Course.findById(attempt.course).select('courseTitle');

        res.status(200).json({ success: true, attempt, courseTitle: course.courseTitle, courseId: attempt.course });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};