import { Accessory, TradfriClient } from "node-tradfri-client";

export const getDevices = async (
  client: TradfriClient
): Promise<Accessory[]> => {
  const devices: Accessory[] = [];
  client.on("device updated", (device: Accessory) => devices.push(device));
  await client.observeDevices();

  return devices;
};

export const getDeviceByName = (
  name: string,
  devices: Accessory[]
): Accessory | undefined => devices.find((device) => device.name === name);
