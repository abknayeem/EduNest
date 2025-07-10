import { User } from "../models/user.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import sendEmail from "../utils/sendEmail.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationTokenExpires = Date.now() + 3600000; // 1 hour

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'student',
      verificationToken,
      verificationTokenExpires,
    });

    try {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        const emailHtml = `<p>Hi ${name},</p><p>Welcome to EduNest! Please click the link below to verify your email address:</p><a href="${verificationUrl}">${verificationUrl}</a><p>This link will expire in one hour.</p>`;

        await sendEmail({
          email: user.email,
          subject: 'EduNest - Email Verification',
          html: emailHtml,
        });
        
    } catch (emailError) {
        console.error("!!! FAILED TO SEND VERIFICATION EMAIL !!!");
        console.error("Error details:", emailError);
        return res.status(201).json({
            success: true,
            message: "Account created, but could not send verification email. Please check server logs.",
        });
    }

    return res.status(201).json({
      success: true,
      message: `A verification email has been sent to ${user.email}. Please check your inbox.`,
    });
  } catch (error) {
    console.log("Registration Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to Register." });
  }
};

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"All Fields are Required."
            })
        }
        const user = await User.findOne({email});
        if(!user){
             return res.status(400).json({
                success:false,
                message:"Incorrect Email or Password"
            })
        }
        
        if (user.isDisabled) {
            return res.status(403).json({
                success: false,
                message: "Your account has been disabled. Please contact support."
            });
        }

        if (!user.isVerified && user.role !== 'superadmin') {
            return res.status(401).json({
                success: false,
                message: "Please verify your email before logging in."
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                success:false,
                message:"Incorrect Email or Password"
            });
        }
        generateToken(res, user, `Welcome Back ${user.name}`);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to Login."
        })
    }
}

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification token. Please try registering again." });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to verify email." });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User with that email does not exist." });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const emailHtml = `<p>Hi ${user.name},</p><p>You requested a password reset for your EduNest account. Click the link below to set a new password:</p><a href="${resetUrl}">${resetUrl}</a><p>If you did not request this, please ignore this email. This link will expire in one hour.</p>`;

    await sendEmail({
      email: user.email,
      subject: 'EduNest - Password Reset Request',
      html: emailHtml,
    });

    res.status(200).json({ success: true, message: `A password reset link has been sent to ${email}.` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error sending password reset email." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired password reset token." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    user.isVerified = true; 

    await user.save();

    res.status(200).json({ success: true, message: "Password has been reset successfully. You can now log in with your new password." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to reset password." });
  }
};

export const requestInstructorRole = async (req, res) => {
  try {
    const user = await User.findById(req.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (user.role !== 'student') {
        return res.status(400).json({ success: false, message: "Only students can apply to become instructors." });
    }

    user.instructorApplicationStatus = 'pending';
    await user.save();

    res.status(200).json({ success: true, message: "Your request has been submitted and is pending review." });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error while submitting request." });
  }
};

export const verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required." });
    }

    const user = await User.findById(req.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect password." });
    }

    res.status(200).json({ success: true, message: "Password verified." });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error during password verification." });
  }
};

export const logout = async (_,res) => {
    try {
        return res.status(200).cookie("token", "", {maxAge:0}).json({
        message:"Logged Out Successfully.",
        success:true
        })
    } catch (error) {
       console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to Logout"
        }) 
    }
}

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.id;
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
        .json({ message: "Profile not Found", success: false });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to Load User" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { name, alternativeNumber, gender, age, occupation, education, institute, address, bio } = req.body;
    const profilePhoto = req.file;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not Found", success: false });
    }

    const updatedData = {
      name: name || user.name,
      alternativeNumber: alternativeNumber || user.alternativeNumber,
      gender: gender || user.gender,
      age: age || user.age,
      occupation: occupation || user.occupation,
      education: education || user.education,
      institute: institute || user.institute,
      address: address || user.address,
      bio: bio || user.bio,
    };

    if (profilePhoto) {
      if (user.photoUrl) {
        const publicId = user.photoUrl.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId);
      }
      const cloudResponse = await uploadMedia(profilePhoto.path);
      updatedData.photoUrl = cloudResponse.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    }).select("-password");

    return res
      .status(200)
      .json({
        success: true,
        user: updatedUser,
        message: "Profile Updated Successfully.",
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to Update Profile" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "All password fields are required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect old password." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to change password." });
  }
};

export const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.id;
        const transactions = await CoursePurchase.find({ userId, status: 'completed' })
            .populate({
                path: 'courseId',
                select: 'courseTitle'
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, transactions });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to fetch transaction history." });
    }
};
