import { createLogger, transports, format, Logger } from "winston";

export const getLogger = (): Logger =>
  createLogger({
    level: "verbose",
    format: format.json(),
    transports: [new transports.Console({ format: format.simple() })],
  });
