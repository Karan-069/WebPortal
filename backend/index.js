import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import connectDB from "./src/config/db.config.js";
import { app } from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Backend Server is running on Port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB Connection Failed", err);
  });
