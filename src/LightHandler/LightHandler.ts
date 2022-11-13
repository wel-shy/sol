import { Light, SmartLightHub } from "../SmartLightHub";
import { Logger } from "winston";
import { getSteppedIncrementValue } from "../utils/math";
import { getNextRgb, isEqual } from "./rgb";
import { sleep } from "../utils/process";

const MAX_FADE_ITERATIONS = 100;

interface FadeOptions {
  transitions?: number;
  delay?: number;
}

export const fadeLight = async (
  hub: SmartLightHub,
  light: Light,
  from: number[],
  to: number[],
  logger: Logger,
  { transitions = 20, delay = 1 }: FadeOptions = {}
) => {
  const incrementSteps = from.map((value, index) =>
    getSteppedIncrementValue(value, to[index], transitions)
  );

  let iteration = 0;
  let currentRgb = [...from];

  logger.info(`Fading light: ${light.id || light.name}`);
  while (!isEqual(currentRgb, to) && iteration < MAX_FADE_ITERATIONS) {
    const [r, g, b] = getNextRgb(currentRgb, to, incrementSteps);

    await hub.setLight(light, {
      on: true,
      rgb: [r, g, b],
      transitionTime: delay,
    });

    currentRgb = [r, g, b];
    iteration++;

    logger.verbose(
      `Fading light: ${light.id || light.name} (iteration ${iteration})`
    );

    await sleep(delay * 2 * 1000);
  }

  logger.info(`Faded light: ${light.id || light.name}`);
};
