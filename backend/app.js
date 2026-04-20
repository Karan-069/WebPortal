import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import logger from "./src/utils/logger.js";
import { tenantMiddleware } from "./src/middlewares/tenant.middleware.js";

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. Postman, curl)
      if (!origin) return callback(null, true);

      const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";

      // Support subdomains (match client.localhost:3000 or exactly localhost:3000)
      const allowedBase = allowedOrigin.replace(/^https?:\/\//, "");
      const originBase = origin.replace(/^https?:\/\//, "");

      if (origin === allowedOrigin || originBase.endsWith(`.${allowedBase}`)) {
        callback(null, true);
      } else {
        logger.error(`❌ CORS Blocking: origin ${origin} not in allowed list`);
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Tenant-Id"],
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Request logging with morgan linked to Winston
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

// Multi-tenant separation middleware
app.use(tenantMiddleware);

// Importing Routes
import userRouter from "./src/routes/user.routes.js";
import departmentRouter from "./src/routes/department.routes.js";
import appMenuRouter from "./src/routes/appMenu.routes.js";
import userRoleRouter from "./src/routes/userRoles.routes.js";
import workflowRoleRouter from "./src/routes/workflowRole.routes.js";
import stateRouter from "./src/routes/state.routes.js";
import cityRouter from "./src/routes/city.routes.js";
import crtermRouter from "./src/routes/crterm.routes.js";
import subsidaryRouter from "./src/routes/subsidary.routes.js";
import uomRouter from "./src/routes/uom.routes.js";
import assetCategoryRouter from "./src/routes/assetCategory.routes.js";
import billRouter from "./src/routes/bill.routes.js";
import vendorRouter from "./src/routes/vendor.routes.js";
import itemRouter from "./src/routes/item.routes.js";
import notificationRouter from "./src/routes/notification.routes.js";
import vendorInviteRouter from "./src/routes/vendorInvite.routes.js";
import workflowRouter from "./src/routes/workflow.routes.js";
import workflowLogRouter from "./src/routes/workflowLog.routes.js";
import locationRouter from "./src/routes/location.routes.js";
import assetRouter from "./src/routes/asset.routes.js";
import nextTransactionIdRouter from "./src/routes/nextTransactionId.routes.js";
import clientRouter from "./src/routes/client.routes.js";
import licenseRouter from "./src/routes/license.routes.js";
import settingsRouter from "./src/routes/settings.routes.js";
import emailTemplateRouter from "./src/routes/emailTemplate.routes.js";
import featureRouter from "./src/routes/feature.routes.js";
import auditLogRouter from "./src/routes/auditLog.routes.js";
import dashboardRouter from "./src/routes/dashboard.routes.js";
import lineOfBusinessRouter from "./src/routes/lineOfBusiness.routes.js";
import chartOfAccountsRouter from "./src/routes/chartOfAccounts.routes.js";

// Declaring Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/departments", departmentRouter);
app.use("/api/v1/app-menus", appMenuRouter);
app.use("/api/v1/user-roles", userRoleRouter);
app.use("/api/v1/workflow-roles", workflowRoleRouter);
app.use("/api/v1/states", stateRouter);
app.use("/api/v1/cities", cityRouter);
app.use("/api/v1/crterms", crtermRouter);
app.use("/api/v1/subsidaries", subsidaryRouter);
app.use("/api/v1/uoms", uomRouter);
app.use("/api/v1/asset-categories", assetCategoryRouter);
app.use("/api/v1/bills", billRouter);
app.use("/api/v1/vendors", vendorRouter);
app.use("/api/v1/items", itemRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/vendor-invites", vendorInviteRouter);
app.use("/api/v1/workflows", workflowRouter);
app.use("/api/v1/workflow-logs", workflowLogRouter);
app.use("/api/v1/locations", locationRouter);
app.use("/api/v1/assets", assetRouter);
app.use("/api/v1/transaction-ids", nextTransactionIdRouter);
app.use("/api/v1/clients", clientRouter);
app.use("/api/v1/licenses", licenseRouter);
app.use("/api/v1/settings", settingsRouter);
app.use("/api/v1/email-templates", emailTemplateRouter);
app.use("/api/v1/features", featureRouter);

app.use("/api/v1/audit-logs", auditLogRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/line-of-businesses", lineOfBusinessRouter);
app.use("/api/v1/chart-of-accounts", chartOfAccountsRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // CRITICAL: Clear cookies if the session is unauthorized/dead
  if (statusCode === 401 || statusCode === 403) {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export { app };
