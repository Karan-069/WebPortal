import dotenv from "dotenv";
import connectDB from "./src/config/db.config.js";
import {app} from "./app.js";

dotenv.config({
    path: "./.env"
});

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on Port : ${process.env.PORT}`)
    })
})
.catch((err => {
    console.log ("MONGO DB Connection Failed" , err)
}));