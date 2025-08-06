import Stripe from "stripe";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { User } from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";
import { generateInvoice } from "../utils/generateInvoice.js";
import { uploadPdf } from "../utils/cloudinary.js";
import fs from "fs";
import path from "path";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PLATFORM_FEE_PERCENTAGE = 0.30;

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not Found" });
    }

    const newPurchase = new CoursePurchase({
      courseId,
      userId,
      amount: course.coursePrice,
      platformFee: course.coursePrice * PLATFORM_FEE_PERCENTAGE,
      instructorRevenue: course.coursePrice * (1 - PLATFORM_FEE_PERCENTAGE),
      status: "pending",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: course.courseTitle,
              images: [course.courseThumbnail],
            },
            unit_amount: course.coursePrice * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/course-progress/${courseId}`,
      cancel_url: `${process.env.FRONTEND_URL}/course-detail/${courseId}`,
      metadata: {
        courseId: courseId,
        userId: userId,
      },
      shipping_address_collection: {
        allowed_countries: ["BD"],
      },
    });

    if (!session.url) {
      return res
        .status(400)
        .json({ success: false, message: "Error while creating session" });
    }

    newPurchase.paymentId = session.id;
    await newPurchase.save();

    return res.status(200).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to create checkout session" });
  }
};

export const stripeWebhook = async (req, res) => {
  let event;
  try {
    const payloadString = JSON.stringify(req.body, null, 2);
    const secret = process.env.WEBHOOK_ENDPOINT_SECRET;
    const header = stripe.webhooks.generateTestHeaderString({ payload: payloadString, secret });
    event = stripe.webhooks.constructEvent(payloadString, header, secret);
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    try {
      const session = event.data.object;
      const purchase = await CoursePurchase.findOne({ paymentId: session.id }).populate("courseId");

      if (!purchase || purchase.status === 'completed') {
        return res.status(200).send("Purchase already processed or not found.");
      }

      const totalAmount = session.amount_total / 100;
      const platformFee = totalAmount * PLATFORM_FEE_PERCENTAGE;
      const instructorRevenue = totalAmount - platformFee;

      purchase.amount = totalAmount;
      purchase.platformFee = platformFee;
      purchase.instructorRevenue = instructorRevenue;
      purchase.status = "completed";
      
      const invoiceDir = path.join(process.cwd(), 'invoices');
      if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir);
      const invoicePath = path.join(invoiceDir, `invoice-${purchase._id}.pdf`);
      
      await generateInvoice(purchase, invoicePath);
      const uploadedInvoice = await uploadPdf(invoicePath);
      if (uploadedInvoice) purchase.invoiceUrl = uploadedInvoice.secure_url;
      
      await purchase.save();
      fs.unlinkSync(invoicePath);

      await User.findByIdAndUpdate(
        purchase.courseId.creator,
        { $inc: { currentBalance: instructorRevenue } }
      );

      await User.findByIdAndUpdate(purchase.userId, { $addToSet: { enrolledCourses: purchase.courseId._id } });
      await Course.findByIdAndUpdate(purchase.courseId._id, { $addToSet: { enrolledStudents: purchase.userId } });

      const user = await User.findById(purchase.userId);
      if (user) {
        const emailHtml = `<p>Hi ${user.name},</p><p>Thank you for your purchase! You have successfully enrolled in the course: <strong>${purchase.courseId.courseTitle}</strong>.</p><p>Your invoice is attached to this email. You can also access it from your profile's transaction history.</p><p>You can start learning right away by visiting your "My Learning" page or by clicking the link below:</p><a href="${process.env.FRONTEND_URL}/course-progress/${purchase.courseId._id}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;">Start Course Now</a><p>Happy learning!</p><p>The EduNest Team</p>`;
        await sendEmail({
            email: user.email,
            subject: `Enrollment Confirmation & Invoice for ${purchase.courseId.courseTitle}`,
            html: emailHtml,
            attachments: [{ filename: `invoice-${purchase._id}.pdf`, path: purchase.invoiceUrl, contentType: 'application/pdf' }]
        });
      }
    } catch (error) {
      console.error("Error handling webhook event:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  res.status(200).send();
};

export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId)
      .populate({ path: "creator", select: "name photoUrl occupation bio" })
      .populate({ path: "lectures" });

    if (!course) {
      return res.status(404).json({ message: "Course not found!" });
    }

    let purchased = false;
    
    if (userId) {
      const purchaseRecord = await CoursePurchase.findOne({
        userId,
        courseId,
        status: "completed",
      });
      purchased = !!purchaseRecord;
    }

    return res.status(200).json({
      course,
      purchased,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getAllPurchasedCourse = async (_, res) => {
  try {
    const purchasedCourse = await CoursePurchase.find({
      status: "completed",
    }).populate("courseId");

    if (!purchasedCourse) {
      return res.status(404).json({
        purchasedCourse: [],
      });
    }
    
    return res.status(200).json({
      purchasedCourse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to retrieve purchased courses" });
  }
};
