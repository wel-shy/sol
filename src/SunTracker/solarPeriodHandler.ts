import { getTimes } from "suncalc";
import { SolarPeriod } from "./SunTracker";

interface TimePeriod {
  start: Date;
  end: Date;
  id: SolarPeriod;
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
  return date.getTime() > start.getTime() && date.getTime() <= end.getTime();
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
