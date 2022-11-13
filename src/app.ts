import * as dotenv from "dotenv";
import { Accessory } from "node-tradfri-client";
import {
  authenticateToGateway,
  createClient,
  getGateway,
} from "./gateway/client";
import { getDeviceByName, getDevices } from "./gateway/devices";
import { fadeLight } from "./gateway/lights";
import {
  getSolarPeriod,
  getSunPositionTimeMap,
  SolarPeriod,
  SolarRgbMap,
} from "./sun";

dotenv.config();

const POLLING_INTERVAL = 1000 * 60 * 1;

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
  isFading: boolean,
  light: Accessory | undefined
): boolean => {
  if (previousSolarPeriod === currentPeriod || isFading) {
    return false;
  }

  if (!light) {
    console.log("light not found");
    return false;
  }

  return true;
};

export const app = async () => {
  const { LAT, LON, TRADFRI_SECURITY_CODE } = process.env;
  if (!LAT || !LON || !TRADFRI_SECURITY_CODE) {
    throw new Error("Missing environment variables");
  }

  const lightName = getLightName();

  let isFading = false;
  let previousSolarPeriod: SolarPeriod | null = null;

  // TODO: Establish connection to gateway within interval callback
  const result = await getGateway();
  if (!result) {
    throw new Error("No gateway found");
  }

  const client = await createClient(result);
  await authenticateToGateway(client, TRADFRI_SECURITY_CODE);

  const devices = await getDevices(client);

  const interval = setInterval(async () => {
    const timeStamps = getSunPositionTimeMap(
      new Date(),
      parseFloat(LAT),
      parseFloat(LON)
    );
    const solarPeriod = getSolarPeriod(new Date(), timeStamps);
    const light = getDeviceByName(lightName, devices);

    if (
      !canStartTransition(solarPeriod, previousSolarPeriod, isFading, light)
    ) {
      return;
    }

    // TODO: Transition over a time period of 15 minutes
    await fadeLight(
      client,
      light!,
      SolarRgbMap[previousSolarPeriod || SolarPeriod.SUNSET],
      SolarRgbMap[solarPeriod],
      {
        transitions: 10,
        setisFading: (fading) => (isFading = fading),
      }
    );

    previousSolarPeriod = solarPeriod;
  }, POLLING_INTERVAL);

  client.destroy();
};
