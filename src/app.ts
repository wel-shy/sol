import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import {
  authenticateToGateway,
  createClient,
  getGateway,
} from "./gateway/client";
import { getDeviceByName, getDevices } from "./gateway/devices";
import { fadeLight, rgbToHex } from "./gateway/lights";

dotenv.config();

export const app = new Promise<void>(async (resolve, reject) => {
  const securityCode = process.env.TRADFRI_SECURITY_CODE;
  if (!securityCode) {
    reject("No security code provided");
    return;
  }

  const result = await getGateway();
  if (!result) {
    throw new Error("No gateway found");
  }

  const client = await createClient(result);
  await authenticateToGateway(client, securityCode);

  const devices = await getDevices(client);

  const deskLight = getDeviceByName("Desk", devices);
  const cabinetLights = getDeviceByName("Cabinets", devices);
  if (!deskLight || !cabinetLights) {
    throw new Error("No desk light found");
  }

  await client.operateLight(deskLight, {
    onOff: true,
    color: rgbToHex(255, 0, 0),
  });
  await client.operateLight(cabinetLights, {
    onOff: true,
    color: rgbToHex(0, 0, 255),
  });

  await fadeLight(client, deskLight, [255, 0, 0], [0, 0, 255]);

  client.destroy();

  resolve();
});
