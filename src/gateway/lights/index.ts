import { Accessory, TradfriClient } from "node-tradfri-client";
import { getSteppedIncrementValue } from "../../utils/math";
import { sleep } from "../../utils/process";
import { getNextRgb, isEqual, rgbToHex } from "./rgb";

interface FadeOptions {
  transitions?: number;
  delay?: number;
}

export const fadeLight = async (
  client: TradfriClient,
  light: Accessory,
  from: number[],
  to: number[],
  { transitions = 20, delay = 1 }: FadeOptions = {}
) => {
  const incrementSteps = from.map((value, index) =>
    getSteppedIncrementValue(value, to[index], transitions)
  );

  let iteration = 0;
  let currentRgb = [...from];
  while (!isEqual(currentRgb, to) && iteration < 100) {
    const [r, g, b] = getNextRgb(currentRgb, to, incrementSteps);

    await client.operateLight(light, {
      onOff: true,
      color: rgbToHex(r, g, b),
      transitionTime: delay,
    });

    currentRgb = [r, g, b];
    iteration++;

    await sleep(delay * 2 * 1000);
  }

  console.log("Fade complete");
};
