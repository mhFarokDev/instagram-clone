import mongoose from 'mongoose';

const tokenSchems = mongoose.Schema({
    userId : {
        type :String,
        trim : true,
    },
    token : {
        type : String,
        trim : true,
    }
},{
    timestamps : true
})


export default mongoose.model('tokens', tokenSchems)