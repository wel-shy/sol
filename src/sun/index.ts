import { getTimes } from "suncalc";

export enum SolarPeriod {
  SUNRISE = "sunrise",
  MORNING = "morning",
  AFTERNOON = "afternoon",
  SUNSET = "sunset",
  NIGHT = "night",
  BLUE_HOUR = "blueHour",
  BLUE_HOUR_DAWN = "blueHourDawn",
}

interface TimePeriod {
  start: Date;
  end: Date;
  id: SolarPeriod;
}

interface SolarTimesStamps {
  morningBlueHour: TimePeriod;
  sunrise: TimePeriod;
  morning: TimePeriod;
  afternoon: TimePeriod;
  sunset: TimePeriod;
  eveningBlueHour: TimePeriod;
}

export const getSunPositionTimeMap = (
  date: Date,
  latitude: number,
  longitude: number
): TimePeriod[] => {
  const {
    dawn,
    sunrise,
    sunset,
    goldenHourEnd: sunriseEnd,
    goldenHour,
    solarNoon,
    nauticalDusk,
  } = getTimes(date, latitude, longitude);

  return [
    {
      start: dawn,
      end: sunrise,
      id: SolarPeriod.BLUE_HOUR_DAWN,
    },
    {
      start: sunrise,
      end: sunriseEnd,
      id: SolarPeriod.SUNRISE,
    },
    {
      start: sunriseEnd,
      end: solarNoon,
      id: SolarPeriod.MORNING,
    },
    {
      start: solarNoon,
      end: goldenHour,
      id: SolarPeriod.AFTERNOON,
    },
    {
      start: goldenHour,
      end: sunset,
      id: SolarPeriod.SUNSET,
    },
    {
      start: sunset,
      end: nauticalDusk,
      id: SolarPeriod.BLUE_HOUR,
    },
  ];
};

const isDateInPeriod = (date: Date, { start, end }: TimePeriod): boolean => {
  return date.getTime() < start.getTime() && date.getTime() >= end.getTime();
};

export const getSolarPeriod = (
  date: Date,
  solarPeriods: TimePeriod[]
): SolarPeriod => {
  const period = solarPeriods.find((period) => isDateInPeriod(date, period));
  return period ? period.id : SolarPeriod.NIGHT;
};

export const getNextSolarPeriod = (
  currentPeriod: SolarPeriod,
  solarPeriods: TimePeriod[]
): SolarPeriod => {
  if (currentPeriod === SolarPeriod.NIGHT) {
    return SolarPeriod.BLUE_HOUR_DAWN;
  }

  if (currentPeriod === SolarPeriod.BLUE_HOUR) {
    return SolarPeriod.NIGHT;
  }

  const idx = solarPeriods.findIndex((period) => period.id === currentPeriod);
  return solarPeriods[idx + 1].id;
};

const BLUE_HOUR_RGB = [50, 0, 183];

export const SolarRgbMap: Record<SolarPeriod, number[]> = {
  [SolarPeriod.BLUE_HOUR]: BLUE_HOUR_RGB,
  [SolarPeriod.BLUE_HOUR_DAWN]: BLUE_HOUR_RGB,
  [SolarPeriod.SUNRISE]: [255, 138, 101],
  [SolarPeriod.MORNING]: [242, 228, 223],
  [SolarPeriod.AFTERNOON]: [255, 224, 178],
  [SolarPeriod.SUNSET]: [251, 140, 0],
  [SolarPeriod.NIGHT]: [155, 0, 155],
};
