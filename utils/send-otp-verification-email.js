import bcrypt from "bcrypt"
import sendEmail from "../utils/send-email-format.js"
import EmailVerification from "../models/emailVerificationModel.js"
let saltRounds = parseInt(process.env.SALT_ROUNDS, 10);
console.log("saltRounds",saltRounds)


export default async function sendOTPverificationEmail({id, name, email}){
    try{
       const otp = Math.floor(1000 + (Math.random()*9000))
       const emailSent = sendEmail(email, "Verify Your Email", `Hi ${name}!!!!`, `<p>Thank you for registering with us. Enter OTP <b>${otp}</b> to complete your registration process `)
       const hashedOTP = bcrypt.hashSync(otp.toString(), saltRounds)
       const verifiedEmail = await EmailVerification.create({userId:id,email,otp:hashedOTP,createdAt:Date.now(),expiresAt: Date.now()+ 3600000})
       if(verifiedEmail){
        return verifiedEmail
       }
    }catch(err){
        console.log("error",err)
    }
}