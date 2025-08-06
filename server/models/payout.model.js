import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema({
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'declined'],
        default: 'pending'
    },
    paymentMethod: { type: String, default: 'Bank Transfer' },
    declineReason: { type: String },
    requestedAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
}, { timestamps: true });

export const Payout = mongoose.model("Payout", payoutSchema);