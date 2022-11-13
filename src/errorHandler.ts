import { Logger } from "winston";

export const handleGlobalError = (error: Error, logger: Logger) => {
  logger.error(error.message);
  process.exit(1);
};
