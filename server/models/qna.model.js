import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    content: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const questionSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    answers: [answerSchema]
}, { timestamps: true });

export const Question = mongoose.model("Question", questionSchema);