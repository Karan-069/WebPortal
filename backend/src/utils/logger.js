import winston from "winston";
import path from "path";

const { combine, timestamp, printf, colorize, json } = winston.format;

// Custom log format for readable console output
const consoleFormat = printf(
  ({ level, message, timestamp, tenantId, userId, ...metadata }) => {
    let log = `${timestamp} [${level}] ${tenantId ? `(Tenant: ${tenantId}) ` : ""}${userId ? `(User: ${userId}) ` : ""}: ${message}`;
    if (Object.keys(metadata).length) {
      log += ` \nMetadata: ${JSON.stringify(metadata, null, 2)}`;
    }
    return log;
  },
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json()),
  transports: [
    // Standard output for all logs
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), consoleFormat),
    }),
    // Error files for critical tracking
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log for production auditing
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

export default logger;
