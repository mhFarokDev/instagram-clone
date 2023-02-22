import mongoose from "mongoose";

const connectDatabase = ()=>{
    try {
        const connect = mongoose.connect(process.env.MONGO_STRING)
        console.log(`MongoDB Is connect successfully.`.bgBlue);
    } catch (error) {
        console.log(error);
    }
}

export default connectDatabase;