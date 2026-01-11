import { readConfig, setUser } from "./config.js";

function main() {
  setUser("name");
  const cfg = readConfig();

  for (const [key, val] of Object.entries(cfg)) {
    console.log(`${key}: ${val}`);
  }
}

main();
