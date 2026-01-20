import { getPostsForUser } from "src/lib/db/queries/posts";
import { User } from "src/lib/db/queries/users";

export async function handlerBrowse(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  let limit = 2;

  if (args.length > 0) {
    const newLimit = parseInt(args[0], 10);
    if (!Number.isNaN(newLimit)) {
      limit = newLimit;
    }
  }

  const posts = await getPostsForUser(user.name, limit);

  console.log(`Found ${posts.length} posts for user ${user.name}`);
  for (const post of posts) {
    console.log(`${post.posts.publishedAt} from ${post.feeds.name}`);
    console.log(`--- ${post.posts.title} ---`);
    if (post.posts.description) {
      console.log(`    ${post.posts.description.slice(0, 100)}...`);
    }
    console.log(`Link: ${post.posts.url}`);
    console.log("======================================");
    console.log();
  }
}
