import User from "../models/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import util from 'util'
import sendEmail from "../utils/send-email-format.js";
import sendOTPverificationEmail from "../utils/send-otp-verification-email.js"

const userController = {
    register : async (req, res, next)=>{
        try{
            const {firstName, lastName, email, password, confirmPassword,tc} = req.body
            const userExist = await User.findOne({email: email})
             if(!!userExist){
                return res.status(400).json({status: "failed", message: "User Already Exist"})
            }
            if(!firstName || !lastName || !email || !password || !confirmPassword || !tc){
                return res.status(400).json({status: "failed", message: "Please provide required details"})    
            }
            if(password !== confirmPassword){
                return res.status(400).json({status: "failed", message: "Confirm password and Password do not match"})                
            }
            let user = await User.create({firstName,lastName, email, password, tc})
            if(!user){
                return res.status(500).json({ status: "failed", message: "Something went wrong while creating the user" });
            }
            //Generate Token
            if(!!user){
                const token = jwt.sign({userId: user._id}, req.app.get('secretKey'), {expiresIn: '30m'})
                user.password = undefined
                console.log("yuerrr", user)
                if(token){ 
                    //commented fornow, for stopping unneccessary emails sending while deveploment
                    // const sendOTPverified =  sendOTPverificationEmail({id:user._id, name:user.firstName, email:user.email})  
                    
                    // if(sendOTPverified){
                        return res.status(201).json({status: "success", message: "User Created Successfully", data: user, token: token})
                    // }
                }
            }
        }catch(err){        
            next(err)
        }
    },
    login : async(req, res, next)=>{
    try{
        const {email, password} = req.body
        if(!email || !password){
            return res.status(400).json({status: "failed", message: "Please provide required details"})   
        }
        const user = await User.findOne({email})
        if(!user){
            return res.status(401).json({status:"failed", message:"User Not Found", data: {}})
        }
        const bcryptCompare = util.promisify(bcrypt.compare);
        const result = await bcryptCompare(password, user.password)
        if(!result){
            return res.status(401).json({ status: "failed", message: "Email or Password does not match", data: {} });
        }
         //Generate Token 
        const token = jwt.sign({userId: user._id}, req.app.get('secretKey'), {expiresIn: '30m'})
        user.password = undefined
        if(token){                        
            return res.status(200).json({status:"success", message:"User Found", data: user, token: token})
        }        
    }catch(err){
        next(err)
    }
    },
    changePassword: async(req, res, next)=>{
     try{
        const {password, confirmPassword} = req.body
        if(!password && !confirmPassword){
            res.status(400).json({status: "falied", message:"All fiels are required"})   
        }
        if(password !== confirmPassword){
            res.status(400).json({status: "falied", message:"Password and Confirm Password should be same"})
        }              
        const updatedUser = await User.findOneAndUpdate({_id: req.user._id}, {
            $set: {password: password}})
        if(!updatedUser){  
            res.status(404).json({status: "Failure", message:"User not found"})         
        }
            res.status(200).json({status: "success", message:"Password Changed Successfully!!"})                
        
     }catch(err){
        return res.status(500).json({status: "failure", message:err.message})
     }
 
    },
    getUserDetails:async (req, res, next)=>{
        try{
            if(!req.body.id){
                return res.status(400).json({status:"failed", message:"No user Id found"
            })}
            const user = await User.findById(req.body.id).select("-password")
            if(!user){
                return res.status(404).json({status:"failed", message:"User not found"})
            }
             return res.status(200).json({status:"success", message:"User found Successfully", data:user})
        }catch(err){
            next(err)
        }
    },
    sendResetPasswordEmail: async(req, res, next)=>{
        try{
            const {email} = req.body
            if(!email){
                return res.status(400).json({status:"failed", message:"Please provide an  email"})
            }
            const user = await User.findOne({email: email})
            if(!user){
                return res.status(404).json({status:"failed", message:"No User Found"})
            }
            //generate token
            const token = jwt.sign({userId: user._id}, req.app.get("secretKey"),{expiresIn:"15m"})
            const link =  `${process.env.APP_URL}/user/reset-password/${user._id}/${token}`
            //send email
            const emailSent = await sendEmail(user.email,"Helloooo!!!","Hi there", `<p>Please click this button for password reset</p><br><Button><a href=${link}>Click Here</a></Button>`)
            if(emailSent){
                return res.status(500).json({status:"success", message:"Email Sent!!..Check your inbox"})
            }           
        }catch(err){
            next(err)
        }

    },
    resetPassword:async(req, res, next)=>{
        try{
            const {password, confirmPassword}=req.body
        const {id, token}= req.params

        if(!password || !confirmPassword){
            return res.status(400).json({status:"failed", message:"All fields are required"})
        }
        if(password !== confirmPassword){
            return res.status(400).json({status:"failed", message:"Password and Confirm Password should be same"})
        }
        if (password.length < 8) {
            return res.status(400).json({ status: "failed", message: "Password should be at least 8 characters long" });
        }
        const user = await User.findById(id)
        if(!user){
            return res.status(404).json({status:"failed", message:"User not found"})  
        }
        const verifiedUser = await jwt.verify(token, req.app.get("secretKey"))
        if(!verifiedUser || verifiedUser.userId !== user._id.toString()){
            return res.status(404).json({status:"failed", message:"User is not verified"})
        }
        const updatedUser = await User.findByIdAndUpdate(id, {$set:{password:password}},{ new: true })
        if(!updatedUser){
        return res.status(500).json({status:"suceess", message:"Password not updated"})
        }
        return res.status(200).json({status:"suceess", message:"Password Changed Successfully!!"})
        }catch(err){
            if(err.name =="JsonWebTokenError"){
                return res.status(404).json({status:"failed", message:err.message})   
            }
            if(err.name =="TokenExpiredError"){
                return res.status(404).json({status:"failed",message:"Token is expired, Please login again"})
            }
            return res.status(404).json({status:"failed", message:"something went wrong"})   
        }
        
    },
    logout : ()=>{}
}


export default userController;