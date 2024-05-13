import User from "../models/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import util from 'util'

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
                if(token){                        
                    return res.status(201).json({status: "success", message: "User Created Successfully", data: user, token: token})
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
        const result = bcryptCompare(password, user.password)

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
    logout : ()=>{}
}


export default userController;