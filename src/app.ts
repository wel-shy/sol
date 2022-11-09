import * as dotenv from "dotenv";
import {
  authenticateToGateway,
  createClient,
  getGateway,
} from "./gateway/client";
import { getDeviceByName, getDevices } from "./gateway/devices";
import { fadeLight } from "./gateway/lights";
import {
  getNextSolarPeriod,
  getSolarPeriod,
  getSunPositionTimeMap,
  SolarRgbMap,
} from "./sun";
import { sleep } from "./utils/process";

dotenv.config();

export const app = async () => {
  const { LAT, LON, TRADFRI_SECURITY_CODE } = process.env;
  if (!LAT || !LON || !TRADFRI_SECURITY_CODE) {
    throw new Error("Missing environment variables");
  }

  let isFading = false;
  let previousSolarPeriod = null;

  const [, , lightName] = process.argv;
  if (!lightName) {
    throw new Error("Please provide a light name");
  }

  const result = await getGateway();
  if (!result) {
    throw new Error("No gateway found");
  }

  const client = await createClient(result);
  await authenticateToGateway(client, TRADFRI_SECURITY_CODE);

  const devices = await getDevices(client);

  while (true) {
    const timeStamps = getSunPositionTimeMap(
      new Date(),
      parseFloat(LAT),
      parseFloat(LON)
    );
    const solarPeriod = getSolarPeriod(new Date(), timeStamps);
    const nextSolarPeriod = getNextSolarPeriod(solarPeriod, timeStamps);
    if (previousSolarPeriod === solarPeriod) {
      continue;
    }

    if (isFading) {
      continue;
    }

    const light = getDeviceByName(lightName, devices);
    if (!light) {
      console.log("light not found");
      continue;
    }

    await fadeLight(
      client,
      light,
      SolarRgbMap[solarPeriod],
      SolarRgbMap[nextSolarPeriod],
      {
        transitions: 10,
        setisFading: (fading) => (isFading = fading),
      }
    );

    previousSolarPeriod = solarPeriod;

    await sleep(1000 * 60 * 1);
  }
  client.destroy();
};
