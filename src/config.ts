import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
  dbUrl: string;
  currentUserName: string;
};

export function setUser(name: string) {
  const config = {
    dbUrl: "postgres://example",
    currentUserName: name,
  };
  writeConfig(config);

  return config;
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

function validateConfig(rawConfig): Config {
  console.log(rawConfig);
  return {
    dbUrl: rawConfig.dbUrl,
    currentUserName: rawConfig.currentUserName,
  };
}
