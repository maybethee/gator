import { sql, eq } from "drizzle-orm";
import { db } from "..";
import { feedFollows, feeds, posts, users } from "../schema";

export type Post = typeof posts.$inferSelect;

export async function createPost(
  title: string,
  description: string,
  url: string,
  publishedAt: string,
  feedId: string,
) {
  const [result] = await db
    .insert(posts)
    .values({
      title: title,
      description: description,
      url: url,
      publishedAt: new Date(publishedAt),
      feedId: feedId,
    })
    .onConflictDoNothing({ target: posts.url })
    .returning();
  return result;
}

export async function getPostsForUser(userName: string, limit: number) {
  const [user] = await db.select().from(users).where(eq(users.name, userName));

  const results = await db
    .select()
    .from(posts)
    .innerJoin(feedFollows, eq(posts.feedId, feedFollows.feedId))
    .innerJoin(feeds, eq(posts.feedId, feeds.id))
    .where(eq(feedFollows.userId, user.id))
    .orderBy(sql`${posts.publishedAt} desc`)
    .limit(limit);

  return results;
}
