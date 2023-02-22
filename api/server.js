import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import userRouter from "./routes/userRouter.js";
import connectDatabase from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser"
import cors from "cors"
const app = express();

// dotenv config
dotenv.config()
const PORT = process.env.SERVER_PORT || 5000;

// middelware
app.use(express.json())
app.use(express.urlencoded({extended : false}))

// CORS policy issue fix
app.use(cors())

// init cookie-parser before API
app.use(cookieParser())

// express REST API
app.use('/api/user', userRouter)

// error handler
app.use(errorHandler)
// express listen
app.listen(PORT, ()=>{
    // mongoDB connection
    connectDatabase()
    console.log(`server is run on port ${PORT}`.bgGreen.white);
})