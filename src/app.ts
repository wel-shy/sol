import * as dotenv from "dotenv";
import {
  authenticateToGateway,
  createClient,
  getGateway,
} from "./gateway/client";
import { getDeviceByName, getDevices } from "./gateway/devices";
import { fadeLight } from "./gateway/lights";
import { getLogger } from "./logger";
import StateHandler from "./state/StateHandler";
import {
  getSolarPeriod,
  getSunPositionTimeMap,
  SolarPeriod,
  SolarRgbMap,
} from "./sun";

dotenv.config();

const getLightName = (): string => {
  const [, , lightName] = process.argv;
  if (!lightName) {
    throw new Error("Please provide a light name");
  }

  return lightName;
};

const canStartTransition = (
  currentPeriod: SolarPeriod,
  previousSolarPeriod: SolarPeriod | null,
  isFading: boolean
): boolean => {
  if (previousSolarPeriod === currentPeriod || isFading) {
    return false;
  }

  return true;
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
  const lightName = getLightName();

  const stateHandler = new StateHandler(STATE_PATH, Logger);
  const { isFading, solarPeriod: previousSolarPeriod } =
    await stateHandler.getApplicationState();

  if (isDryRun()) {
    Logger.info("Dry run, exiting");
    process.exit(0);
  }

  const result = await getGateway();
  if (!result) {
    Logger.error("No gateway found");
    process.exit(1);
  }

  const client = await createClient(result);
  await authenticateToGateway(client, TRADFRI_SECURITY_CODE);
  const devices = await getDevices(client);
  const light = getDeviceByName(lightName, devices);

  if (!light) {
    Logger.error("light not found");
    process.exit(1);
  }

  const timeStamps = getSunPositionTimeMap(
    new Date(),
    parseFloat(LAT),
    parseFloat(LON)
  );
  const solarPeriod = getSolarPeriod(new Date(), timeStamps);

  if (!canStartTransition(solarPeriod, previousSolarPeriod, isFading)) {
    Logger.info("Current period is the same as previous period, exiting");
    client.destroy();
    process.exit(0);
  }

  await stateHandler.storeApplicationState({
    solarPeriod,
    isFading: true,
  });

  // TODO: Transition over a time period of 15 minutes
  await fadeLight(
    client,
    light!,
    SolarRgbMap[previousSolarPeriod],
    SolarRgbMap[solarPeriod],
    Logger,
    {
      transitions: 10,
    }
  );

  await stateHandler.storeApplicationState({
    solarPeriod,
    isFading: false,
  });

  client.destroy();
};
