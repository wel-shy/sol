import * as dotenv from "dotenv";
import { createSmartLightHub, SmartLightHubType } from "./SmartLightHub";
import StateHandler from "./state/StateHandler";
import { SunTracker } from "./SunTracker/SunTracker";
import { getEnvironmentVariables, getProcessArgs } from "./environment";
import { Logger } from "winston";

dotenv.config();

export const app = async (logger: Logger) => {
  const { LAT, LON, HUB_CODE, STATE_PATH } = getEnvironmentVariables();
  const { lightName, dryRun } = getProcessArgs();

  const stateHandler = new StateHandler(STATE_PATH, logger);

  if (dryRun) {
    logger.info("Dry run, exiting");
    process.exit(0);
  }

  logger.info("Starting run");

  const hub = await createSmartLightHub(
    SmartLightHubType.IKEA_TRADFRI,
    HUB_CODE
  );
  const light = await hub.getLight(lightName);
  if (!light) {
    throw new Error("Light not found");
  }

  const sunTracker = new SunTracker(hub, logger, stateHandler);
  const solarPeriod = sunTracker.getCurrentSolarPeriod(LAT, LON);

  logger.info(`Current solar period: ${solarPeriod}`);

  await sunTracker.transitionLightToSolarPeriod(solarPeriod, light);

  logger.info("Update complete");

  hub.destroyConnection();
};
