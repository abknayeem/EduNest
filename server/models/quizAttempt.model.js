import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  passed: {
    type: Boolean,
    default: false,
  },
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    questionText: String,
    selectedAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
  }]
}, { timestamps: true });

export const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);