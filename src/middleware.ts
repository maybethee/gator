import { exit } from "node:process";
import { CommandHandler } from "src";
import { getUser, User } from "./lib/db/queries/users.js";
import { readConfig } from "./config.js";

export type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

export type middlewareLoggedIn = (
  handler: UserCommandHandler,
) => CommandHandler;

export function middlewareLoggedIn(
  handler: UserCommandHandler,
): CommandHandler {
  return async (cmdName: string, ...args: string[]): Promise<void> => {
    const config = readConfig();
    const userName = config.currentUserName;
    if (!userName) {
      console.error(
        `${userName} does not exist in database. Try "npm run start register ${userName}" to register user to the database`,
      );
      exit(1);
    }

    const user = await getUser(userName);
    if (!user) {
      console.error(
        `${userName} does not exist in database. Try "npm run start register ${userName}" to register user to the database`,
      );
      exit(1);
    }

    return handler(cmdName, user, ...args);
  };
}
