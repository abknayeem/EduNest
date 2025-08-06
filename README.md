# EduNest - A Full-Stack Learning Management System (LMS)

### [✨ View the full Portfolio README with Image Gallery ✨](https://htmlpreview.github.io/?https://github.com/abknayeem/EduNest/blob/main/documents/README_Final.html)

---

EduNest is a feature-rich, full-stack Learning Management System built with the MERN stack. Developed as a final year university project, it provides a seamless, modern, and scalable e-learning experience for students, instructors, and administrators.

The platform is a complete, real-world application that handles everything from user authentication and course creation to secure online payments with Stripe, video hosting with Cloudinary, and automated email notifications.

## ✨ Core Features

- **Triple-Role Architecture:** Dedicated dashboards and functionalities for Students, Instructors, and a Superadmin.
- **E-Commerce Ready:** Secure course purchasing powered by the Stripe payment gateway.
- **Rich Content Management:** Instructors can create courses, upload video lectures, and build quizzes.
- **Full Administrative Control:** A Superadmin panel to manage users, courses, categories, finances, and instructor applications.
- **Interactive Learning:** Students can track progress, take quizzes, and receive auto-generated PDF certificates via email.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Redux Toolkit (RTK Query), Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Services:** Stripe (Payments), Cloudinary (Media Hosting), JWT (Auth), Nodemailer (Email)

## 🚀 Getting Started & Installation

To get a local copy of EduNest up and running, follow these steps.

### Prerequisites

- Node.js (v18 or later)
- npm (or yarn/pnpm)
- MongoDB (local instance or a cloud service)
- Git

### Installation

1.  **Clone the Repository**
    ```sh
    git clone [https://github.com/abknayeem/EduNest.git](https://github.com/abknayeem/EduNest.git)
    cd EduNest
    ```

2.  **Set Up the Backend (Server)**
    ```sh
    cd server
    npm install
    ```
    Create a `.env` file in the `/server` directory and populate it with your credentials.

3.  **Set Up the Frontend (Client)**
    ```sh
    cd ../client
    npm install
    ```
    
4.  **Run the Application**
    - Start the backend server (from the `/server` directory): `npm run dev`
    - Start the frontend server (from the `/client` directory): `npm run dev`

The application will be available at `http://localhost:5173`.

### Environment Variables

You will need to create a `.env` file in the `server` directory. Below is an explanation of the required variables:

| Variable                  | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `MONGO_URI`               | Your MongoDB connection string.                        |
| `SECRET_KEY`              | A secret key for signing JWT tokens.                   |
| `API_KEY`                 | Your Cloudinary API key.                               |
| `API_SECRET`              | Your Cloudinary API secret.                            |
| `CLOUD_NAME`              | Your Cloudinary cloud name.                            |
| `STRIPE_SECRET_KEY`       | Your Stripe secret key for processing payments.        |
| `WEBHOOK_ENDPOINT_SECRET` | Your Stripe webhook secret for confirming payments.    |
| `SMTP_HOST`               | Hostname of your SMTP email server.                    |
| `SMTP_PORT`               | Port for your SMTP server (e.g., 465 or 587).          |
| `SMTP_USER`               | Username for your SMTP server.                         |
| `SMTP_PASS`               | Password for your SMTP server.                         |
| `SUPERADMIN_EMAIL`        | The email for the default superadmin account.          |
| `SUPERADMIN_PASSWORD`     | The password for the default superadmin account.       |
| `FRONTEND_URL`            | The base URL of the frontend (e.g., http://localhost:5173). |


## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

*(**Action Required:** Create a new file named `LICENSE` in the root of your project and paste the text of the MIT license into it.)*