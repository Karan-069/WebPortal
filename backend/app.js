import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//Importing Routes.
import userRouter from "./src/routes/user.routes.js";
import departmentRouter from "./src/routes/department.routes.js";
import appMenuRouter from "./src/routes/appMenu.routes.js";

// Declearing Routes.
app.use("/api/v1/users", userRouter);
app.use("/api/v1/departments", departmentRouter);
app.use("/api/v1/menus", appMenuRouter);

export { app };
