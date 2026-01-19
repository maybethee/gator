import { db } from "..";
import { posts } from "../schema";

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
