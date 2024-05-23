import bcrypt from "bcrypt"
import sendEmail from "../utils/send-email-format.js"
import EmailVerification from "../models/emailVerificationModel.js"
let saltRounds = parseInt(process.env.SALT_ROUNDS, 10);

export default async function sendOTPverificationEmail({id, name, email}){
    try{
       const otp = Math.floor(1000 + (Math.random()*9000))
       const emailContent = `
       <p>Hi ${name},</p>
       <p>Thank you for registering with us. Enter the OTP <b>${otp}</b> to complete your registration process.</p>`
       const emailSent = await sendEmail(email, "Verify Your Email", `Hi ${name}!!!!`, emailContent);
       if(!emailSent){
        throw new Error('Email sending failed');
       }
       const hashedOTP = bcrypt.hashSync(otp.toString(), saltRounds)
       const expiresAt = Date.now() + 3600000; // 1 hour from now

       const verifiedEmail = await EmailVerification.create({userId:id,email,otp:hashedOTP,createdAt:Date.now(),expiresAt})
       if(verifiedEmail){
        return verifiedEmail
       }else {
        throw new Error('Email verification creation failed');
    }
    }catch(err){
        console.log("error",err)
    }
}