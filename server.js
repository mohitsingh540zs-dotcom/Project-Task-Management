import app from "./src/app.js";
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./src/config/db.js";
const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.log("Server Error");
    process.exit(1);
  }
};

startServer();
