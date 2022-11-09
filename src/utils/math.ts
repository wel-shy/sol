export const incrementInSteps = (
  current: number,
  target: number,
  step: number,
  upperBound: number,
  lowerBound: number
) => {
  const nextValue = current + step;
  if (current === target || nextValue === target) {
    return target;
  }

  if (Math.abs(nextValue - target) <= Math.abs(step)) {
    return target;
  }

  if (nextValue >= upperBound) {
    return upperBound;
  }

  if (nextValue <= lowerBound) {
    return lowerBound;
  }

  return Math.round(nextValue);
};

export const getSteppedIncrementValue = (
  current: number,
  target: number,
  step: number
) => {
  const distance = Math.abs(current - target);
  const coef = current <= target ? 1 : -1;
  const incrementValue = Math.ceil(coef * (distance / step));

  if (Math.abs(incrementValue) === 0) {
    return coef;
  }

  return incrementValue;
};
