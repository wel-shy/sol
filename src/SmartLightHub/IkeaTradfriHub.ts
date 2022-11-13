import { Accessory, discoverGateway, TradfriClient } from "node-tradfri-client";
import { SmartLightHub, Light, SetLightOptions } from ".";
import { rgbToHex } from "../LightHandler/rgb";

export class IkeaTradfriHub implements SmartLightHub {
  client: TradfriClient | undefined;
  devices: Accessory[] = [];

  constructor(private code: string) {}

  async createConnection(): Promise<void> {
    const gateway = await this.getGateway();
    if (!gateway) {
      throw new Error("Gateway not found");
    }

    this.client = new TradfriClient(gateway.addresses[0]);
    await this.authenticateToGateway();
    this.client?.on("device updated", (device: Accessory) =>
      this.devices.push(device)
    );
  }

  destroyConnection() {
    this.client?.destroy();
  }

  private async getGateway() {
    const gateway = await discoverGateway();
    return gateway;
  }

  private async authenticateToGateway() {
    if (!this.client) {
      throw new Error("Client not created");
    }

    const { identity, psk } = await this.client.authenticate(this.code);
    await this.client.connect(identity, psk);
  }

  async getLights(): Promise<Light[]> {
    this.devices = [];
    await this.client?.observeDevices();

    return this.devices as unknown as Light[];
  }

  async getLight(id: string): Promise<Light | undefined> {
    await this.getLights();
    return this.devices.find(
      (device) => device.name === id
    ) as unknown as Light;
  }

  async setLight(
    light: Light,
    { rgb, on, transitionTime }: SetLightOptions
  ): Promise<void> {
    const [r, g, b] = rgb;

    await this.client?.operateLight(light as unknown as Accessory, {
      onOff: on,
      color: rgbToHex(r, g, b),
      transitionTime,
    });
  }
}
