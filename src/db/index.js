import mongoose from "mongoose";
import { DB_NAME } from "../constatnts.js";




const connectDB =async()=>{
try {
    const connection= await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
    console.log(`\n mongodb connected`)
} catch (error) {
    console.log("error:",error);
    process.exit(1)
    
}
}
export default connectDB