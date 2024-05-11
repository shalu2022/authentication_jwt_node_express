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
    // this.plainPassword = this.password;
    this.password = bcrypt.hashSync(this.password, saltRounds);
    next();
})

userSchema.pre(["updateOne", "findByIdAndUpdate", "findOneAndUpdate"], async function (next) {
    const data = this.getUpdate();
    if (data.password) {
        data.password = await bcrypt.hashSync(data.password, saltRounds);
    }
    next()

});

export default mongoose.model('user',userSchema)