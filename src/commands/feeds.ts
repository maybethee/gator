import { readConfig } from "../config.js";
import { exit } from "node:process";
import { getUser, getUserById, type User } from "../lib/db/queries/users.js";
import { createFeed, getFeeds, type Feed } from "src/lib/db/queries/feeds.js";

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
  console.log("Feed:");
  for (const [key, val] of Object.entries(feed)) {
    console.log(`- ${key}: ${val}`);
  }
  console.log(`- User: ${user.name}`);
}

export async function handlerListFeeds() {
  const feeds = await getFeeds();

  if (feeds.length === 0) {
    console.log("No feeds found.");
    return;
  }

  console.log(`Found ${feeds.length} feeds:\n`);
  for (let feed of feeds) {
    const user = await getUserById(feed.userId);
    if (!user) {
      throw new Error(`Failed to find user for feed ${feed.id}`);
    }

    printFeed(user, feed);
    console.log();
  }
}
