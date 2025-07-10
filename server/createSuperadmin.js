import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/user.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || 'admin@edunest.com';
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || 'supersecret123';

const createSuperadmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected for script');

        const existingAdmin = await User.findOne({ email: SUPERADMIN_EMAIL });

        if (existingAdmin) {
            console.log('Superadmin already exists.');
            return;
        }

        const hashedPassword = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);

        const admin = new User({
            name: 'EduNest Admin',
            email: SUPERADMIN_EMAIL,
            password: hashedPassword,
            role: 'superadmin',
        });

        await admin.save();
        console.log('Superadmin created successfully!');
        console.log(`Email: ${SUPERADMIN_EMAIL}`);
        console.log(`Password: ${SUPERADMIN_PASSWORD}`);

    } catch (error) {
        console.error('Error creating superadmin:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB Disconnected');
    }
};

createSuperadmin();
