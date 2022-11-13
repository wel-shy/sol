import { Logger } from "winston";
import { fadeLight } from "../LightHandler/LightHandler";
import { Light, SmartLightHub } from "../SmartLightHub";
import StateHandler, { ApplicationState } from "../state/StateHandler";
import { getSolarPeriod, getSunPositionTimeMap } from "./solarPeriodHandler";

export enum SolarPeriod {
  SUNRISE = "sunrise",
  MORNING = "morning",
  AFTERNOON = "afternoon",
  SUNSET = "sunset",
  NIGHT = "night",
  BLUE_HOUR = "blueHour",
  BLUE_HOUR_DAWN = "blueHourDawn",
}

const BLUE_HOUR_RGB = [50, 0, 183];
const SolarRgbMap: Record<SolarPeriod, number[]> = {
  [SolarPeriod.BLUE_HOUR]: BLUE_HOUR_RGB,
  [SolarPeriod.BLUE_HOUR_DAWN]: BLUE_HOUR_RGB,
  [SolarPeriod.SUNRISE]: [255, 138, 101],
  [SolarPeriod.MORNING]: [242, 228, 223],
  [SolarPeriod.AFTERNOON]: [255, 224, 178],
  [SolarPeriod.SUNSET]: [251, 140, 0],
  [SolarPeriod.NIGHT]: [155, 0, 155],
};

export class SunTracker {
  constructor(
    private hub: SmartLightHub,
    private logger: Logger,
    private stateHandler: StateHandler
  ) {}

  getCurrentSolarPeriod(lat: string, lon: string): SolarPeriod {
    const timeStamps = getSunPositionTimeMap(
      new Date(),
      Number.parseFloat(lat),
      Number.parseFloat(lon)
    );
    return getSolarPeriod(new Date(), timeStamps);
  }

  async transitionLightToSolarPeriod(
    solarPeriod: SolarPeriod,
    light: Light
  ): Promise<void> {
    const state = await this.stateHandler.getApplicationState();

    if (!this.canStartTransition(state, solarPeriod)) {
      this.logger.info(
        "Current period is the same as previous period, exiting"
      );
      this.hub.destroyConnection();
      return;
    }

    await this.stateHandler.storeApplicationState({
      solarPeriod,
      isFading: true,
    });

    await fadeLight(
      this.hub,
      light,
      SolarRgbMap[state.solarPeriod],
      SolarRgbMap[solarPeriod],
      this.logger,
      {
        transitions: 10,
      }
    );

    await this.stateHandler.storeApplicationState({
      solarPeriod,
      isFading: false,
    });
  }

  private canStartTransition(
    state: ApplicationState,
    solarPeriod: SolarPeriod
  ): boolean {
    const { solarPeriod: previousSolarPeriod, isFading } = state;
    return previousSolarPeriod !== solarPeriod && !isFading;
  }
}
