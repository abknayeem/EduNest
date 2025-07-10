import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["instructor", "student", "superadmin"],
    },
    instructorApplicationStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'refused'],
      default: 'none',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    photoUrl: {
      type: String,
      default: "",
    },
    alternativeNumber: {
      type: String,
      default: ""
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", ""],
      default: ""
    },
    age: {
      type: Number,
    },
    occupation: {
      type: String,
      default: ""
    },
    education: {
      type: String,
      default: ""
    },
    institute: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      default: ""
    },
    bio: {
        type: String,
        default: ""
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
