import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
    name : {
        type : String,
        trim : true,
    },
    email : {
        type : String,
        trim : true,
        unique : true
    },
    call : {
        type : String,
        trim : true,
        default : "#"
    },
    userName : {
        type : String,
        trim : true,
    },
    password : {
            type : String
        },
    photo : {
            type : String,
            default : '#'
        },
    isVerifyed : {
            type : Boolean,
            default : false
        },
    isAdmin : {
            type : Boolean,
            default : false
        },
    status : {
            type : Boolean,
            default : true
        },
    trash : {
            type : Boolean,
            default : false
        }
},{
    timestamps : true
})

export default mongoose.model('users', userSchema)