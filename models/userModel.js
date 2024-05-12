import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
const Schema = mongoose.Schema
const saltRounds = 10;

const userSchema = new Schema({
    firstName:{
        type: String,
        trim: true,
        required: true
    },
    lastName:{
        type: String,
        trim: true,
        required: true
    },
    email:{
        type: String,
        trim: true,
        required: true
    },
    password:{
        type: String,
        trim: true,
        required: true
    },
    // plainPassword:{
    //     type: String,
    // },
    tc:{
        type: Boolean,
        required: true
    }
},
{ timestamps: true }
)

userSchema.pre('save', async function(next){
    var user = this;
    if(!user.isModified('password')){
        return next()
    }
    this.password = bcrypt.hashSync(this.password, saltRounds);
    next();
})

userSchema.pre(["updateOne", "findByIdAndUpdate", "findOneAndUpdate"], async function (next) {
    let modifiedField = this.getUpdate()['$set'].password
    if (modifiedField) {
        let encryptedPassword = await bcrypt.hashSync(modifiedField, saltRounds);
        this.getUpdate()['$set'].password = encryptedPassword;
    }
    next()

});

export default mongoose.model('user',userSchema)