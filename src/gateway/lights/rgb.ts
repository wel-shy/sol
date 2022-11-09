import { incrementInSteps } from "../../utils/math";

const MAX_RGB_VALUE = 255;
const MIN_RGB_VALUE = 0;

export const rgbToHex = (r: number, g: number, b: number) =>
  [r, g, b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("");

export const isEqual = (a: number[], b: number[]) => a.join("") === b.join("");

export const getNextRgb = (
  current: number[],
  to: number[],
  incrementSteps: number[]
) =>
  current.map((value, index) =>
    incrementInSteps(
      value,
      to[index],
      incrementSteps[index],
      MAX_RGB_VALUE,
      MIN_RGB_VALUE
    )
  );
