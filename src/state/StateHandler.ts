import { readState, writeState } from "./file";
import { Logger } from "winston";
import { SolarPeriod } from "../SunTracker/SunTracker";

export interface ApplicationState {
  solarPeriod: SolarPeriod;
  isFading: boolean;
}

export default class StateHandler {
  DEFAULT_STATE = {
    solarPeriod: SolarPeriod.NIGHT,
    isFading: false
  };

  constructor(private path: string, private logger: Logger) {}

  async getApplicationState(): Promise<ApplicationState> {
    try {
      const state = await readState<ApplicationState>(this.path);
      if (!state) {
        this.logger.warn("No state found, using default state");
        return this.DEFAULT_STATE;
      }

      this.logger.info("State found, using state", { state });
      return state;
    } catch (error) {
      this.logger.error(error);
    }

    return this.DEFAULT_STATE;
  }

  async storeApplicationState(state: ApplicationState): Promise<void> {
    await writeState(this.path, state);
  }
}
