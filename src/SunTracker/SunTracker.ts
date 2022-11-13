import { Logger } from "winston";
import { fadeLight } from "../LightHandler/LightHandler";
import { Light, SmartLightHub } from "../SmartLightHub";
import StateHandler, { ApplicationState } from "../state/StateHandler";
import {
  getSolarPeriod,
  getSunPositionTimeMap,
  SolarRgbMap,
} from "./solarPeriodHandler";

export enum SolarPeriod {
  SUNRISE = "sunrise",
  MORNING = "morning",
  AFTERNOON = "afternoon",
  SUNSET = "sunset",
  NIGHT = "night",
  BLUE_HOUR = "blueHour",
  BLUE_HOUR_DAWN = "blueHourDawn",
}

export class SunTracker {
  constructor(
    private hub: SmartLightHub,
    private logger: Logger,
    private stateHandler: StateHandler
  ) {}

  getCurrentSolarPeriod(lat: string, lon: string): SolarPeriod {
    const timeStamps = getSunPositionTimeMap(
      new Date(),
      parseFloat(lat),
      parseFloat(lon)
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
      process.exit(0);
    }

    await this.stateHandler.storeApplicationState({
      solarPeriod,
      isFading: true,
    });

    // TODO: Transition over a time period of 15 minutes
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
