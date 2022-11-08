import { Accessory, TradfriClient } from "node-tradfri-client";

const isTarget = (current: number[], target: number[]) =>
  current.join("") === target.join("");

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
    getIncrementValue(value, to[index], transitions)
  );

  let iteration = 0;
  let currentRgb = [...from];
  while (!isTarget(currentRgb, to) && iteration < 100) {
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

const getNextRgb = (
  current: number[],
  to: number[],
  incrementSteps: number[]
) =>
  current.map((value, index) =>
    updateValue(value, to[index], incrementSteps[index])
  );

const getIncrementValue = (current: number, target: number, step: number) => {
  const distance = Math.abs(current - target);
  const coef = current <= target ? 1 : -1;
  return Math.ceil(coef * (distance / step));
};

const updateValue = (current: number, target: number, step: number) => {
  const nextValue = current + step;
  if (Math.abs(nextValue - target) < step) {
    return target;
  }

  if (nextValue >= 255) {
    return 255;
  }

  if (nextValue <= 0) {
    return 0;
  }

  return Math.round(nextValue);
};

const sleep = (waitTimeInMs: number) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

export const rgbToHex = (r: number, g: number, b: number) =>
  [r, g, b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("");
