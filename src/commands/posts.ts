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
  for (let i = 0; i < limit; i++) {
    console.log(`${i + 1}: ${posts[i].feeds.name} - ${posts[i].posts.title}`);
  }
}
