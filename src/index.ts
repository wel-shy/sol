import { app } from "./app";
import { handleGlobalError } from "./errorHandler";
import { getLogger } from "./utils/logger";

const logger = getLogger();
app(logger)
  .then()
  .catch(error => handleGlobalError(error, logger));
