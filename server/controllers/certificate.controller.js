import { QuizAttempt } from "../models/quizAttempt.model.js";
import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { generateCertificate } from "../utils/generateCertificate.js";
import sendEmail from "../utils/sendEmail.js";
import fs from "fs";
import path from "path";

export const sendCertificateByEmail = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const studentId = req.id;

        const attempt = await QuizAttempt.findById(attemptId);
        
        if (!attempt) {
            return res.status(404).json({ success: false, message: "Quiz attempt not found." });
        }

        if (attempt.student.toString() !== studentId) {
            return res.status(403).json({ success: false, message: "You are not authorized to access this certificate." });
        }

        if (!attempt.passed) {
            return res.status(400).json({ success: false, message: "You have not passed the quiz for this course." });
        }

        const [student, course] = await Promise.all([
            User.findById(studentId),
            Course.findById(attempt.course)
        ]);
        
        const tempDir = path.join(process.cwd(), 'temp_certs');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }
        
        const certificatePath = path.join(tempDir, `certificate-${attempt._id}.pdf`);
        const completionDate = new Date(attempt.createdAt).toLocaleDateString();

        await generateCertificate(student.name, course.courseTitle, completionDate, certificatePath);

        const emailHtml = `
            <p>Hi ${student.name},</p>
            <p>Congratulations on successfully completing the course: <strong>${course.courseTitle}</strong>!</p>
            <p>Your hard work has paid off. Please find your certificate of completion attached to this email.</p>
            <p>We wish you the best in your future endeavors!</p>
            <p>The EduNest Team</p>
        `;

        await sendEmail({
            email: student.email,
            subject: `Your Certificate for ${course.courseTitle}`,
            html: emailHtml,
            attachments: [{
                filename: `certificate-${course.courseTitle.replace(/\s/g, '_')}.pdf`,
                path: certificatePath,
                contentType: 'application/pdf'
            }]
        });

        fs.unlinkSync(certificatePath);

        res.status(200).json({ success: true, message: "Certificate has been sent to your email." });

    } catch (error) {
        console.error("Error sending certificate:", error);
        res.status(500).json({ success: false, message: "Failed to send certificate." });
    }
};