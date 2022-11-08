import { incrementInSteps } from "../../utils/math";

export const Colors = {
  BLUE: [0, 0, 255],
  RED: [255, 0, 0],
  GREEN: [0, 255, 0],
  WHITE: [255, 255, 255],
};

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
    incrementInSteps(value, to[index], incrementSteps[index], 255, 0)
  );
