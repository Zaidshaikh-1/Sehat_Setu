import mongoose from "mongoose";
import { DB_NAME } from "./dbname.js";

const connectDb = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    const connection = await mongoose.connect(`${uri}/${DB_NAME}`);
    console.log(`MongoDB connected! Host: ${connection.connection.host}, DB: ${DB_NAME}`);
  } catch (error) {
    console.error("MONGODB CONNECTION ERROR:", error);
    process.exit(1);
  }
};

export { connectDb };
