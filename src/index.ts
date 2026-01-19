import { argv, exit } from "node:process";
import {
  handlerLogin,
  handlerRegister,
  handlerReset,
  handlerUsers,
} from "./commands/users.js";
import {
  handlerListFeeds,
  handlerAddFeed,
  handlerFollow,
  handlerFollowing,
  handlerUnfollow,
} from "./commands/feeds.js";
import { handlerAgg } from "./commands/rss.js";
import { middlewareLoggedIn } from "./middleware.js";
import { handlerBrowse } from "./commands/posts.js";

export type CommandHandler = (
  cmdName: string,
  ...args: string[]
) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;

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
  registerCommand(registry, "users", handlerUsers);
  registerCommand(registry, "agg", handlerAgg);
  registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed));
  registerCommand(registry, "feeds", handlerListFeeds);
  registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
  registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));
  registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollow));
  registerCommand(registry, "browse", middlewareLoggedIn(handlerBrowse));
  await runCommand(registry, passedArgs[0], ...passedArgs.slice(1));
  process.exit(0);
}

main();
