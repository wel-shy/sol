import * as dotenv from "dotenv";
import {
  authenticateToGateway,
  createClient,
  getGateway,
} from "./gateway/client";
import { getDeviceByName, getDevices } from "./gateway/devices";
import { fadeLight } from "./gateway/lights";
import { Colors } from "./gateway/lights/rgb";

dotenv.config();

export const app = async () => {
  const [, , lightName] = process.argv;
  if (!lightName) {
    throw new Error("Please provide a light name");
  }

  const securityCode = process.env.TRADFRI_SECURITY_CODE;
  if (!securityCode) {
    throw new Error("No security code provided");
  }

  const result = await getGateway();
  if (!result) {
    throw new Error("No gateway found");
  }

  const client = await createClient(result);
  await authenticateToGateway(client, securityCode);

  const devices = await getDevices(client);

  const light = getDeviceByName(lightName, devices);
  if (!light) {
    throw new Error(`Could not find light with name ${lightName}`);
  }

  await fadeLight(client, light, Colors.RED, Colors.WHITE, {
    transitions: 10,
  });
  await fadeLight(client, light, Colors.WHITE, Colors.BLUE),
    { transitions: 10 };

  client.destroy();
};
