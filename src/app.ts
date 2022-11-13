import * as dotenv from "dotenv";
import { getLogger } from "./utils/logger";
import { createSmartLightHub, SmartLightHubType } from "./SmartLightHub";
import StateHandler from "./state/StateHandler";
import { SunTracker } from "./SunTracker/SunTracker";

dotenv.config();

const getLightName = (): string => {
  const [, , lightName] = process.argv;
  if (!lightName) {
    throw new Error("Please provide a light name");
  }

  return lightName;
};

const isDryRun = (): boolean => {
  const [, , , dryRun] = process.argv;
  return dryRun === "dry-run";
};

export const app = async () => {
  const { LAT, LON, TRADFRI_SECURITY_CODE, STATE_PATH } = process.env;
  if (!LAT || !LON || !TRADFRI_SECURITY_CODE || !STATE_PATH) {
    throw new Error("Missing environment variables");
  }

  const Logger = getLogger();
  const stateHandler = new StateHandler(STATE_PATH, Logger);

  if (isDryRun()) {
    Logger.info("Dry run, exiting");
    process.exit(0);
  }

  const hub = await createSmartLightHub(
    SmartLightHubType.IKEA_TRADFRI,
    TRADFRI_SECURITY_CODE
  );
  const light = await hub.getLight(getLightName());
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
