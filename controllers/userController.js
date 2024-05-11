import User from "../models/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userController = {
    register : async (req, res, next)=>{
        try{
            const {firstName, lastName, email, password, confirmPassword,tc} = req.body
            const userExist = await User.findOne({email: email})
             if(!!userExist){
                res.json({status: "failed", message: "User Already Exist"})
            }else{
                if(!firstName || !lastName || !email || !password || !confirmPassword || !tc){
                    res.json({status: "failed", message: "Please provide required details"})
                    return
                }
                if(password !== confirmPassword){
                    res.json({status: "failed", message: "Confirm password and Password do not match"})
                    return
                }
                let user = await User.create({firstName,lastName, email, password, tc})
                //Generate Token
                if(!!user){
                    const token = jwt.sign({userId: user._id}, req.app.get('secretKey'), {expiresIn: '30m'})
                    user.password = undefined
                    if(token){                        
                        res.status(201).json({status: "success", message: "User Created Successfully", data: user, token: token})
                    }
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
            res.json({status: "failed", message: "Please provide required details"})   
        }
        const user = await User.findOne({email})
        if(!!user){
            bcrypt.compare(password, user.password, (err, result)=>{
            if(err){
                next(err)
            }else{
                if(!result){
                    res.status(401).json({status:"failed", message:"Email or Password does not match", data: {}})
                }else{
                    //Generate Token 
                    const token = jwt.sign({userId: user._id}, req.app.get('secretKey'), {expiresIn: '30m'})
                    user.password = undefined
                    if(token){                        
                        res.status(200).json({status:"success", message:"User Found", data: user, token: token})
                    }                    
                }
         }})}else{
            res.status(401).json({status:"failed", message:"User Not Found", data: {}})
         }        
    }catch(err){
        next(err)
    }
    },
    changePassword: async(req, res, next)=>{
     const {password, confirmPassword} = req.body
     if(!!password && !!confirmPassword){
        if(password !== confirmPassword){
            res.json({status: "falied", message:"Password and Confirm Password should be same"})
        }else{            
            // console.log("password>>>>>>>>",password,confirmPassword)
             const updatedUser = await User.findOneAndUpdate({_id: req.user._id}, password)
             if(updatedUser){     
                console.log("updateduser", updatedUser)           
                 res.json({status: "success", message:"Password Changed Successfully!!"})
             }else{
                res.json({status: "Failure", message:"Something went wrong!!"})
             }
        }
    }else{
        res.json({status: "falied", message:"All fiels are required"})    }
    },
    logout : ()=>{}
}


export default userController;