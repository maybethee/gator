import { setUser, readConfig } from "../config.js";
import { exit } from "node:process";
import {
  createUser,
  getUser,
  getUsers,
  resetUsers,
  type User,
} from "../lib/db/queries/users.js";
import { createFeed, type Feed } from "src/lib/db/queries/feeds.js";

export async function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    console.error("login handler expects username argument");
    exit(1);
  }
  const userName = args[0];

  const user = await getUser(userName);
  if (!user) {
    console.error(
      `${userName} does not exist in database. Try "npm run start register ${userName}" to register user to the database`,
    );
    exit(1);
  }

  setUser(user.name);
  console.log(`current user name set to ${user.name}`);
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    console.error("register handler expects username argument");
    exit(1);
  }

  const userName = args[0];

  try {
    const user = await createUser(userName);
    setUser(userName);
    console.log("New User created:");
    console.log(
      `- id: ${user.id}\n- name: ${user.name}\n- createdAt: ${user.createdAt}\n- updatedAt: ${user.updatedAt}`,
    );
  } catch (err) {
    console.error("createUser failed:", err);
    throw err;
  }
}

export async function handlerReset() {
  try {
    await resetUsers();
  } catch (err) {
    console.error("reset failed:", err);
    throw err;
  }
}

export async function handlerUsers() {
  const config = readConfig();

  const users = await getUsers();

  for (const user of users) {
    if (config.currentUserName === user.name) {
      console.log(`* ${user.name} (current)`);
    } else {
      console.log(`* ${user.name}`);
    }
  }
}

export async function handlerAddFeed(
  cmdName: string,
  name: string,
  url: string,
) {
  const config = readConfig();
  const userName = config.currentUserName;
  const user = await getUser(userName);
  if (!user) {
    console.error(
      `${userName} does not exist in database. Try "npm run start register ${userName}" to register user to the database`,
    );
    exit(1);
  }

  try {
    const feed = await createFeed(name, url, user.id);

    console.log("New Feed created:");
    printFeed(user, feed);
  } catch (err) {
    console.error("add feed failed:", err);
    throw err;
  }
}

function printFeed(user: User, feed: Feed) {
  console.log("User:");
  for (const [key, val] of Object.entries(user)) {
    console.log(`- ${key}: ${val}`);
  }

  console.log();
  console.log("Feed:");
  for (const [key, val] of Object.entries(feed)) {
    console.log(`- ${key}: ${val}`);
  }
}
