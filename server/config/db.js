import mongoose from "mongoose";

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI || "mogodb://localhost:21017/login-platform");
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    }catch(err){
        console.error(`Error ${err.message}`)
        process.exit(1)
    }
}

module.exports = connectDB