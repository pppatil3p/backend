
import 'dotenv/config';
import connectDB from "./db/index.js";
import mongoose, { connect } from "mongoose";
import { DB_NAME } from "./constatnts.js";
import express from "express"

connectDB()









// const app=express()

// (async()=>{ 
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("error:",error);
//             throw error
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`app is running on port $process.env.PORT`);
//         })
//     } catch (error) {
//         console.error("error:,error")
        
//     }
// })()