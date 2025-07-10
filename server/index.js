import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import adminRoute from "./routes/admin.route.js";
import instructorRoute from "./routes/instructor.route.js";
import categoryRoute from "./routes/category.route.js";
import quizRoute from "./routes/quiz.route.js";

dotenv.config({});

connectDB();
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));

app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/instructor", instructorRoute);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/quiz", quizRoute);

app.listen(PORT, () => {
    console.log(`Server listen at port ${PORT}`);
});