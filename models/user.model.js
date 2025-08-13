import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
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
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationCode: String,
    verificationCodeExpiresAt: Date,

    forms: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Form",
            default: []
        }
    ],
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
