import { readFile, writeFile, stat } from "fs/promises";

const ENCODING = "utf8";

interface FSError extends Error {
  code: string;
}

const exists = async (path: string): Promise<boolean> => {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if ((error as FSError).code === "ENOENT") {
      return false;
    }

    throw error;
  }
};

export const readState = async <T>(path: string): Promise<T | null> => {
  if (!exists(path)) {
    return null;
  }

  const state = await readFile(path, ENCODING);
  return JSON.parse(state) as T;
};

export const writeState = async <T>(path: string, state: T): Promise<void> => {
  await writeFile(path, JSON.stringify(state), ENCODING);
};
