import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true, trim: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true }
});

const quizSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, unique: true },
  title: { type: String, required: true, trim: true, default: 'Final Quiz' },
  timeLimit: { type: Number, default: 0 },
  passingScore: {
    type: Number,
    default: 70,
    min: 0,
    max: 100,
  },
  questions: [questionSchema],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Quiz = mongoose.model("Quiz", quizSchema);
