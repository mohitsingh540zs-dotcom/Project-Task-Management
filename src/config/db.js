import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `Connection estabished with MongoDB Sucessfully | ${conn.connection.host}`,
    );
  } catch (error) {
    console.log(`Connection failed,${error.message}`);
    process.exit(1);
  }
};
