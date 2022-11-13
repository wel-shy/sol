import { SolarPeriod } from "../sun";
import { readState, writeState } from "./file";

interface ApplicationState {
  solarPeriod: SolarPeriod;
  isFading: boolean;
}

export default class StateHandler {
  DEFAULT_STATE = {
    solarPeriod: SolarPeriod.NIGHT,
    isFading: false,
  };

  constructor(private path: string) {}

  async getApplicationState(): Promise<ApplicationState> {
    try {
      const state = await readState<ApplicationState>(this.path);
      if (!state) {
        return this.DEFAULT_STATE;
      }
    } catch (error) {
      console.log(error);
    }

    return this.DEFAULT_STATE;
  }

  async storeApplicationState(state: ApplicationState): Promise<void> {
    await writeState(this.path, state);
  }
}
