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
import userRoleRouter from "./src/routes/userRoles.routes.js";
import workflowRoleRouter from "./src/routes/workflowRole.routes.js";
import stateRouter from "./src/routes/state.routes.js";
import cityRouter from "./src/routes/city.routes.js";
import crtermRouter from "./src/routes/crterm.routes.js";
import subsidaryRouter from "./src/routes/subsidary.routes.js";

// Declearing Routes.
app.use("/api/v1/users", userRouter);
app.use("/api/v1/departments", departmentRouter);
app.use("/api/v1/menus", appMenuRouter);
app.use("/api/v1/user-roles", userRoleRouter);
app.use("/api/v1/workflow-roles", workflowRoleRouter);
app.use("/api/v1/states", stateRouter);
app.use("/api/v1/cities", cityRouter);
app.use("/api/v1/crterms", crtermRouter);
app.use("/api/v1/subsidaries", subsidaryRouter);

export { app };
