import { eq } from "drizzle-orm";
import { db } from "..";
import { feeds, users } from "../schema";

export type Feed = typeof feeds.$inferSelect;

export async function createFeed(name: string, url: string, userId: string) {
  const [result] = await db
    .insert(feeds)
    .values({ name: name, url: url, userId: userId })
    .returning();
  return result;
}

export async function feedsOnUsers() {
  const results = await db
    .select()
    .from(feeds)
    .innerJoin(users, eq(feeds.userId, users.id));
  return results;
}
