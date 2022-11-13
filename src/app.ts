import * as dotenv from "dotenv";
import { getLogger } from "./utils/logger";
import { createSmartLightHub, SmartLightHubType } from "./SmartLightHub";
import StateHandler from "./state/StateHandler";
import { SunTracker } from "./SunTracker/SunTracker";
import { getEnvironmentVariables, getProcessArgs } from "./environment";

dotenv.config();

export const app = async () => {
  const { LAT, LON, HUB_CODE, STATE_PATH } = getEnvironmentVariables();
  const { lightName, dryRun } = getProcessArgs();

  const Logger = getLogger();
  const stateHandler = new StateHandler(STATE_PATH, Logger);

  if (dryRun) {
    Logger.info("Dry run, exiting");
    process.exit(0);
  }

  const hub = await createSmartLightHub(
    SmartLightHubType.IKEA_TRADFRI,
    HUB_CODE
  );
  const light = await hub.getLight(lightName);
  if (!light) {
    Logger.error("light not found");
    process.exit(1);
  }

  const sunTracker = new SunTracker(hub, Logger, stateHandler);
  const solarPeriod = sunTracker.getCurrentSolarPeriod(LAT, LON);

  Logger.info(`Current solar period: ${solarPeriod}`);

  await sunTracker.transitionLightToSolarPeriod(solarPeriod, light);

  Logger.info("Update complete");

  hub.destroyConnection();
};
