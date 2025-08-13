import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
// import cloudinary from "../utils/cloudinary.js";
import generateVerificationCode from "../utils/generateVerificationCode.js";
import generateToken from "../utils/generateToken.js";
import {
    sendVerificationEmail,
    sendWelcomeEmail,
} from "../mailtrap/email.js";


export const signup = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({
                success: false,
                message: "User already exist with this email"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationCode = generateVerificationCode(6)

        user = await User.create({
            fullname,
            email,
            password: hashedPassword,
            verificationCode,
            verificationCodeExpiresAt: Date.now() + 24 * 60 * 60 * 1000 //1day
        })
        generateToken(res, user)
        await sendVerificationEmail(email, verificationCode)

         const updatedUser = await User.findOne({ email }).select("-password").populate({
            path: "forms",
            options: { sort: { createdAt: -1 } }  // Sort by createdAt descending (newest first)
        });
        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: updatedUser
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not registered with email-id"
            });

        }
        if (!user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email not verified"
            });

        }

        const isCorrectPassword = await bcrypt.compare(password, user.password)
        if (!isCorrectPassword) {
            return res.status(400).json({
                success: false,
                message: "Incorrect email or password"
            });

        }
        generateToken(res, user)
        await user.save()


        const updatedUser = await User.findOne({ email }).select("-password").populate({
            path: "forms",
            options: { sort: { createdAt: -1 } }  // Sort by createdAt descending (newest first)
        });

        return res.status(200).json({
            success: true,
            message: `Welcome back ${user.fullname}`,
            user: updatedUser
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const verifyEmail = async (req, res) => {
    //verify code sent to email
    try {
        const { verificationCode } = req.body;
        const user = await User.findOne({ verificationCode: verificationCode, verificationCodeExpiresAt: { $gt: Date.now() } }).select("-password").populate("forms");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or Expired verification code"
            })

        }

        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpiresAt = undefined;
        await user.save()

        await sendWelcomeEmail(user.email, user.fullname)

         const updatedUser = await User.findOne({ email }).select("-password").populate({
            path: "forms",
            options: { sort: { createdAt: -1 } }  // Sort by createdAt descending (newest first)
        });

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: updatedUser
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const logout = async (req, res) => {
    try {
        return res.clearCookie("token").status(200).json({
            success: true,
            message: "Looged out successfully"
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const checkAuth = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select("-password").populate({
            path: "forms",
            options: { sort: { createdAt: -1 } }  // Sort by createdAt descending (newest first)
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }
        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

