import { Logger } from "winston";

export const handleGlobalError = (error: Error, logger: Logger) => {
  logger.error("Unhandled error, exiting: ", error);
};
