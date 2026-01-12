import { setUser } from "./config.js";
import { argv, exit } from "node:process";

type CommandHandler = (cmdName: string, ...args: string[]) => void;
type CommandsRegistry = Record<string, CommandHandler>;

function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    throw new Error("login handler expects username argument");
  }
  const user = setUser(args[0]);
  console.log(`current user name set to ${user.currentUserName}`);
}

function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler,
) {
  registry[cmdName] = handler;
}

function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
) {
  if (registry[cmdName]) {
    registry[cmdName](cmdName, ...args);
  }
}

function main() {
  const registry: CommandsRegistry = {};
  const passedArgs = argv.slice(2);
  if (passedArgs.length === 0) {
    console.error("missing at least one additional argument");
    exit(1);
  }
  registerCommand(registry, passedArgs[0], handlerLogin);
  runCommand(registry, passedArgs[0], ...passedArgs.slice(1));
}

main();
