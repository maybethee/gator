import { argv, exit } from "node:process";
import {
  handlerLogin,
  handlerRegister,
  handlerReset,
} from "./commands/users.js";

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
type CommandsRegistry = Record<string, CommandHandler>;

function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler,
) {
  registry[cmdName] = handler;
}

async function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
) {
  if (registry[cmdName]) {
    return await registry[cmdName](cmdName, ...args);
  }
}

async function main() {
  const registry: CommandsRegistry = {};
  const passedArgs = argv.slice(2);
  if (passedArgs.length === 0) {
    console.error("missing at least one additional argument");
    exit(1);
  }
  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", handlerRegister);
  registerCommand(registry, "reset", handlerReset);
  await runCommand(registry, passedArgs[0], ...passedArgs.slice(1));
  process.exit(0);
}

main();
