import { createLogger, transports, format, Logger } from "winston";

export const getLogger = (): Logger =>
  createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: format.combine(
      format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      format.simple()
    ),
    transports: [new transports.Console()],
  });
