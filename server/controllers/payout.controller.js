import { Payout } from "../models/payout.model.js";
import { User } from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";

const MINIMUM_PAYOUT_AMOUNT = 1000;

export const requestPayout = async (req, res) => {
    try {
        const instructorId = req.id;
        const { amount } = req.body;

        const instructor = await User.findById(instructorId);
        if (!instructor) {
            return res.status(404).json({ success: false, message: "Instructor not found." });
        }
        if (!instructor.payoutDetails?.bankAccountNumber) {
            return res.status(400).json({ success: false, message: "Please update your payout details in your profile before requesting a payout." });
        }
        if (amount < MINIMUM_PAYOUT_AMOUNT) {
            return res.status(400).json({ success: false, message: `Minimum payout amount is ৳${MINIMUM_PAYOUT_AMOUNT}.` });
        }
        if (instructor.currentBalance < amount) {
            return res.status(400).json({ success: false, message: "Insufficient balance." });
        }

        await Payout.create({ instructor: instructorId, amount });
        instructor.currentBalance -= amount;
        await instructor.save();

        res.status(201).json({ success: true, message: "Payout request submitted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getPayoutHistoryForInstructor = async (req, res) => {
    try {
        const instructorId = req.id;
        const payouts = await Payout.find({ instructor: instructorId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, payouts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getPendingPayouts = async (req, res) => {
    try {
        const payouts = await Payout.find({ status: 'pending' })
            .populate('instructor', 'name email payoutDetails')
            .sort({ createdAt: 'desc' });
        res.status(200).json({ success: true, payouts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const completePayout = async (req, res) => {
    try {
        const { payoutId } = req.params;
        const payout = await Payout.findByIdAndUpdate(payoutId, {
            status: 'completed',
            completedAt: Date.now()
        }, { new: true }).populate('instructor');

        if (!payout) {
            return res.status(404).json({ success: false, message: "Payout request not found." });
        }
        
        try {
            const emailHtml = `
                <p>Hi ${payout.instructor.name},</p>
                <p>Your payout request for <strong>৳${payout.amount.toLocaleString()}</strong> has been processed and completed.</p>
                <p>The funds should reflect in your account shortly.</p>
                <p>Thank you for teaching on EduNest!</p>
                <p>The EduNest Team</p>
            `;
            await sendEmail({
                email: payout.instructor.email,
                subject: 'Your Payout Request has been Completed',
                html: emailHtml
            });
        } catch (emailError) {
            console.error("Failed to send payout completion email:", emailError);
        }

        res.status(200).json({ success: true, message: "Payout marked as completed." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const declinePayout = async (req, res) => {
    try {
        const { payoutId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ success: false, message: "A reason for declining is required." });
        }

        const payout = await Payout.findById(payoutId).populate('instructor');
        if (!payout || payout.status !== 'pending') {
            return res.status(404).json({ success: false, message: "Pending payout request not found." });
        }

        const instructor = await User.findById(payout.instructor._id);
        instructor.currentBalance += payout.amount;
        
        payout.status = 'declined';
        payout.declineReason = reason;
        
        await Promise.all([payout.save(), instructor.save()]);

        try {
            const emailHtml = `
                <p>Hi ${payout.instructor.name},</p>
                <p>We're writing to inform you that your payout request for <strong>৳${payout.amount.toLocaleString()}</strong> has been declined.</p>
                <p><strong>Reason:</strong> ${reason}</p>
                <p>The requested amount has been returned to your available balance. Please review your payout details or contact support if you have any questions.</p>
                <p>The EduNest Team</p>
            `;
            await sendEmail({
                email: payout.instructor.email,
                subject: 'Update on Your Payout Request',
                html: emailHtml
            });
        } catch (emailError) {
            console.error("Failed to send payout decline email:", emailError);
        }

        res.status(200).json({ success: true, message: "Payout has been declined and the instructor has been notified." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getPayoutHistory = async (req, res) => {
    try {
        const payouts = await Payout.find({ status: { $in: ['completed', 'declined'] } })
            .populate('instructor', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, payouts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};