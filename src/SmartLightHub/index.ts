import { IkeaTradfriHub } from "./IkeaTradfriHub";

export interface Light {
  on: boolean;
  color: string;
  id?: string;
  name?: string;
}

export interface SetLightOptions {
  rgb: number[];
  on: boolean;
  transitionTime: number;
}

export interface SmartLightHub {
  createConnection: () => Promise<void>;
  destroyConnection: () => void;
  getLights: () => Promise<Light[]>;
  getLight: (id: string) => Promise<Light | null>;
  setLight: (light: Light, options: SetLightOptions) => Promise<void>;
}

export const createSmartLightHub = async (
  type: string,
  code: string
): Promise<SmartLightHub> => {
  let hub: SmartLightHub | null = null;
  switch (type) {
    case "ikea-tradfri":
      hub = new IkeaTradfriHub(code);
      break;
  }

  if (!hub) {
    throw new Error("Hub not found");
  }

  await hub.createConnection();
  return hub;
};
