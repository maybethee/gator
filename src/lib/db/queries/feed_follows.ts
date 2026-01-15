import { eq, and } from "drizzle-orm";
import { db } from "..";
import { feedFollows, feeds, users } from "../schema";
import { getFeedByUrl } from "./feeds";

export async function createFeedFollow(userId: string, feedId: string) {
  const [newFeedFollow] = await db
    .insert(feedFollows)
    .values({ userId: userId, feedId: feedId })
    .returning();
  const [row] = await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      feedId: feeds.id,
      feedName: feeds.name,
      userId: users.id,
      userName: users.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(eq(feedFollows.id, newFeedFollow.id));

  return row;
}

export async function getFeedFollowsForUser(userId: string) {
  const results = await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      feedId: feeds.id,
      feedName: feeds.name,
      userId: users.id,
      userName: users.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(eq(feedFollows.userId, userId));
  return results;
}

export async function deleteFeedFollow(userId: string, feedUrl: string) {
  const feed = await getFeedByUrl(feedUrl);

  const [result] = await db
    .delete(feedFollows)
    .where(and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feed.id)))
    .returning();

  return result;
}
