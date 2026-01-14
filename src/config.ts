import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
  dbUrl: string;
  currentUserName: string;
};

export function setUser(name: string) {
  console.log("reading config:");
  const config = readConfig();
  config.currentUserName = name;
  writeConfig(config);

  console.log("updated config:");
  const updatedConfig = readConfig();
  return updatedConfig;
}

export function readConfig(): Config {
  const filePath = getConfigFilePath();
  const contents = fs.readFileSync(filePath, { encoding: "utf8" });
  const validatedConfig = validateConfig(JSON.parse(contents));
  return validatedConfig;
}

function getConfigFilePath(): string {
  return path.join(os.homedir(), "/.gatorconfig.json");
}

function writeConfig(cfg: Config) {
  const stringifiedConfig = JSON.stringify(cfg);
  const filePath = getConfigFilePath();
  fs.writeFileSync(filePath, stringifiedConfig);
}

// @ts-ignore
function validateConfig(rawConfig): Config {
  return {
    dbUrl: rawConfig.dbUrl,
    currentUserName: rawConfig.currentUserName,
  };
}
