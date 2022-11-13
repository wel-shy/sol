#!/usr/bin/env node

import { app } from "./app";
import { handleGlobalError } from "./errorHandler";
import { getLogger } from "./utils/logger";

const logger = getLogger();

app(logger)
  .then(() => {
    process.exit(0);
  })
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch((error) => {
    handleGlobalError(error, logger);
    process.exit(1);
  });
