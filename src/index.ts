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

const commandsInfo = {
  help: {
    name: "help",
    usage: "npm run start help",
    description: "Displays a help message",
  },
  reset: {
    name: "reset",
    usage: "npm run start reset",
    description: "Resets to an empty database",
  },
  register: {
    name: "register",
    usage: "npm run start register <username>",
    description: "Registers a new user",
  },
  login: {
    name: "login",
    usage: "npm run start login <username>",
    description: "Logs in a register user",
  },
  users: {
    name: "users",
    usage: "npm run start users",
    description: "Lists all existing users in database",
  },
  addfeed: {
    name: "addfeed",
    usage: "npm run start addfeed <feedName> <feedURL>",
    description: "Adds a feed to the database",
  },
  feeds: {
    name: "feeds",
    usage: "npm run start feeds",
    description: "Lists all existing feeds in the database",
  },
  follow: {
    name: "follow",
    usage: "npm run start follow <feedURL>",
    description: "Connects an existing feed to an existing user",
  },
  unfollow: {
    name: "unfollow",
    usage: "npm run start unfollow <feedURL>",
    description: "Unfollows a followed feed",
  },
  following: {
    name: "following",
    usage: "npm run start following",
    description: "Lists all feeds followed by user",
  },
  agg: {
    name: "agg",
    usage: "npm run agg <duration>",
    description:
      "Continuously scrapes/saves posts from followed feeds according to passed duration interval",
  },
  browse: {
    name: "browse",
    usage: "npm run browse <number of posts>",
    description:
      "Lists a specified number of most recent saved posts (after running agg)",
  },
};

async function handlerHelp(cmdName: string) {
  console.log();
  console.log("Welcome to gator!");
  console.log("Usage:");
  console.log();
  for (const command of Object.values(commandsInfo)) {
    console.log(`${command.name}: ${command.description}`);
    console.log(`$ ${command.usage}`);
    console.log();
  }
  console.log();
}

async function main() {
  const registry: CommandsRegistry = {};
  const passedArgs = argv.slice(2);
  if (passedArgs.length === 0) {
    console.error("missing at least one additional argument");
    exit(1);
  }
  registerCommand(registry, "help", handlerHelp);
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
