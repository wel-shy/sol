import * as dotenv from "dotenv";
import {
  authenticateToGateway,
  createClient,
  getGateway,
} from "./gateway/client";
import { getDeviceByName, getDevices } from "./gateway/devices";
import { fadeLight, setLightColor } from "./gateway/lights";
import { getSolarPeriod, getSunPositionTimeMap, SolarRgbMap } from "./sun";

dotenv.config();

export const app = async () => {
  const { LAT, LON, TRADFRI_SECURITY_CODE } = process.env;
  if (!LAT || !LON || !TRADFRI_SECURITY_CODE) {
    throw new Error("Missing environment variables");
  }

  const timeStamps = getSunPositionTimeMap(
    new Date(),
    parseFloat(LAT),
    parseFloat(LON)
  );
  const solarPeriod = getSolarPeriod(new Date(), timeStamps);

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

  const light = getDeviceByName(lightName, devices);
  if (!light) {
    throw new Error(`Could not find light with name ${lightName}`);
  }

  await fadeLight(client, light, SolarRgbMap.blueHour, SolarRgbMap.sunrise, {
    transitions: 10,
  });
  await fadeLight(client, light, SolarRgbMap.sunrise, SolarRgbMap.morning),
    { transitions: 10 };

  client.destroy();
};
