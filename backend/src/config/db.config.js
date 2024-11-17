import mongoose from "mongoose";
import { DB_NAME } from "../../constants.js";

const connectDB = async () => {
  try {
    /*
    console.log(
      "MongoDB URI:",
      `${process.env.MONGODB_URI}/${process.env.DB_NAME}`
    );
    */
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    /*
    console.log(
      `\n MongoDB Connection Sucessfull !! DB_HOST : ${connectionInstance.connection.host}`
    );
    */
  } catch (error) {
    console.log("MONGODB Connection Error", error);
    process.exit(1);
  }
};

export default connectDB;
