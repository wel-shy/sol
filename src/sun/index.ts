import { getTimes } from "suncalc";

enum SolarPeriod {
  SUNRISE = "sunrise",
  MORNING = "morning",
  AFTERNOON = "afternoon",
  SUNSET = "sunset",
  NIGHT = "night",
  BLUE_HOUR = "blueHour",
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
): SolarTimesStamps => {
  const {
    dawn,
    sunrise,
    sunset,
    goldenHourEnd: sunriseEnd,
    goldenHour,
    solarNoon,
    nauticalDusk,
  } = getTimes(date, latitude, longitude);

  return {
    morningBlueHour: {
      start: dawn,
      end: sunrise,
      id: SolarPeriod.BLUE_HOUR,
    },
    [SolarPeriod.SUNRISE]: {
      start: sunrise,
      end: sunriseEnd,
      id: SolarPeriod.SUNRISE,
    },
    [SolarPeriod.MORNING]: {
      start: sunriseEnd,
      end: solarNoon,
      id: SolarPeriod.MORNING,
    },
    [SolarPeriod.AFTERNOON]: {
      start: solarNoon,
      end: goldenHour,
      id: SolarPeriod.AFTERNOON,
    },
    [SolarPeriod.SUNSET]: {
      start: goldenHour,
      end: sunset,
      id: SolarPeriod.SUNSET,
    },
    eveningBlueHour: {
      start: sunset,
      end: nauticalDusk,
      id: SolarPeriod.BLUE_HOUR,
    },
  };
};

const dateIsInPeriod = (date: Date, { start, end }: TimePeriod): boolean => {
  return date.getTime() < start.getTime() && date.getTime() >= end.getTime();
};

export const getSolarPeriod = (
  date: Date,
  solarTimeStamps: SolarTimesStamps
): SolarPeriod => {
  const periods = Object.values(solarTimeStamps);
  const period = periods.find((period) => dateIsInPeriod(date, period));
  return period ? period.id : SolarPeriod.NIGHT;
};

const BLUE_HOUR_RGB = [50, 0, 183];

export const SolarRgbMap: Record<SolarPeriod, number[]> = {
  [SolarPeriod.BLUE_HOUR]: BLUE_HOUR_RGB,
  [SolarPeriod.SUNRISE]: [255, 138, 101],
  [SolarPeriod.MORNING]: [242, 228, 223],
  [SolarPeriod.AFTERNOON]: [255, 224, 178],
  [SolarPeriod.SUNSET]: [251, 140, 0],
  [SolarPeriod.NIGHT]: [155, 0, 155],
};
