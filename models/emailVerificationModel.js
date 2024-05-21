import mongoose from "mongoose";
const Schema = mongoose.Schema

const emailVerificationModel = new Schema({
    userId:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        trim: true
    },
    otp:{
        type: String,
        required: true,
        trim: true
    },
    createdAt:{
        type: Date,
    },
    expiresAt:{
        type: Date,
    }
})

const EmailVerification = mongoose.model("EmailVerification", emailVerificationModel)

export default EmailVerification