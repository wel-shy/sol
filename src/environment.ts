export const getEnvironmentVariables = () => {
  const { HUB_TYPE, HUB_CODE, LAT, LON, STATE_PATH } = process.env;

  if (!HUB_TYPE || !HUB_CODE || !LAT || !LON || !STATE_PATH) {
    throw new Error("Please provide all environment variables");
  }

  return {
    HUB_TYPE,
    HUB_CODE,
    LAT,
    LON,
    STATE_PATH
  };
};

export const getProcessArgs = () => {
  const [, , lightName, dryRun] = process.argv;

  if (!lightName) {
    throw new Error("Please provide a light name");
  }

  return {
    lightName,
    dryRun: dryRun === "dry-run"
  };
};
