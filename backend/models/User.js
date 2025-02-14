import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
const { Schema } = mongoose;

const userSchema = mongoose.Schema({
    firstName :{
        type:String,
        require:true
    },
    lastName : {
        type:String,
        require:true
    },
    phone :{
        type:String,
        require:true,
        unique:true
    },
    email: {
        type:String,
        require:true,
        unique:true
    },
    dob: {
         type: Date,
         required: true
    },
    password: { 
        type: String, 
        required: true 
    },
    preferences: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true 
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
})

userSchema.pre('save', async function (next){
    if(!this.isModified('password')){
        next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password  = await bcrypt.hash(this.password, salt)
})

userSchema.methods.matchPassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model('User',userSchema)

export default User