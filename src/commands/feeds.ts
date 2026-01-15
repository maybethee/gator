import { readConfig } from "../config.js";
import { exit } from "node:process";
import { getUser, getUserById, type User } from "../lib/db/queries/users.js";
import {
  createFeed,
  getFeeds,
  getFeedByUrl,
  type Feed,
} from "src/lib/db/queries/feeds.js";
import {
  createFeedFollow,
  getFeedFollowsForUser,
} from "src/lib/db/queries/feed_follows.js";

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

    const feedFollow = await createFeedFollow(user.id, feed.id);
    printFeedFollow(feedFollow.userName, feedFollow.feedName);

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

function printFeedFollow(userName: string, feedName: string) {
  console.log(`User ${userName} is following feed ${feedName}`);
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

export async function handlerFollow(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    console.error("follow handler expects url argument");
    exit(1);
  }

  const url = args[0];

  const config = readConfig();
  const userName = config.currentUserName;
  const user = await getUser(userName);
  const feed = await getFeedByUrl(url);
  if (!user) {
    console.error(
      `${userName} does not exist in database. Try "npm run start register ${userName}" to register user to the database`,
    );
    exit(1);
  }

  try {
    const newRecord = await createFeedFollow(user.id, feed.id);
    console.log(
      `User '${newRecord.userName}' followed feed: ${newRecord.feedName}`,
    );
  } catch (err) {
    console.error("get follow list failed:", err);
    throw err;
  }
}

export async function handlerFollowing() {
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
    const follows = await getFeedFollowsForUser(user.id);
    console.log(`Feeds followed by ${user.name}`);
    for (const follow of follows) {
      console.log(`- ${follow.feedName}`);
    }
  } catch (err) {
    console.error("get follow list failed:", err);
    throw err;
  }
}
