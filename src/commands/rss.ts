import { markFeedFetched, getNextFeedToFetch } from "src/lib/db/queries/feeds";
import { XMLParser } from "fast-xml-parser";
import { exit } from "node:process";
import { createPost, type Post } from "src/lib/db/queries/posts";

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

async function scrapeFeeds() {
  const nextFeed = await getNextFeedToFetch();

  if (!nextFeed) {
    console.log("No feed to scrape!");
    return;
  }

  await markFeedFetched(nextFeed.id);

  const rss = await fetchFeed(nextFeed.url);

  for (const item of rss.channel.item) {
    await createPost(
      item.title,
      item.description,
      item.link,
      item.pubDate,
      nextFeed.id,
    );
    console.log("pub date:", item.pubDate);
  }
}

export async function handlerAgg(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    console.error(`agg command expects: ${cmdName} <duration>`);
    return;
  }

  const durationStr = args[0];
  console.log(`Collecting feeds every ${durationStr}`);
  const timeBetweenReqs = parseDuration(durationStr);

  scrapeFeeds().catch(handleError);

  const interval = setInterval(() => {
    scrapeFeeds().catch(handleError);
  }, timeBetweenReqs);

  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("Shutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
}

function handleError(err: unknown) {
  console.error("Error:", err);
}

function parseDuration(durationStr: string) {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);

  if (!match) {
    console.error("duration could not be parsed");
    exit(1);
  }

  let numPart: number = parseInt(match[1]);

  switch (match[2]) {
    case "s":
      return numPart * 1000;
    case "m":
      return numPart * 60_000;
    case "h":
      return numPart * 3_600_000;
    default:
      // already in ms
      return numPart;
  }
}

async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const response = await fetch(feedURL, {
    method: "GET",
    headers: {
      "User-Agent": "gator",
    },
  });
  const xmlString = await response.text();
  const parser = new XMLParser();

  let jObj = parser.parse(xmlString);

  if (!jObj.rss.channel) {
    console.error("missing channel field on parsed XML obj");
    console.log("the jObj in question: ", jObj);
    exit(1);
  }
  const channel = jObj.rss.channel;

  if (!channel.title || !channel.link || !channel.description) {
    console.error("missing title/link/description field(s) from channel");
    exit(1);
  }

  const title = channel.title;
  const link = channel.link;
  const description = channel.description;
  const items = validateItemField(channel.item);
  const filteredItems = filterItems(items);

  return {
    channel: {
      title: title,
      link: link,
      description: description,
      item: filteredItems,
    },
  };
}

function validateItemField(itemField: RSSItem[]) {
  if (!itemField) {
    return [];
  }
  if (!Array.isArray(itemField)) {
    return [itemField];
  }

  return itemField;
}

function filterItems(itemArr: RSSItem[]): RSSItem[] {
  for (const item of itemArr) {
    let invalid = false;
    for (const key of Object.keys(item)) {
      if (!key) {
        invalid = true;
        break;
      }
    }
    if (invalid) {
      const id = itemArr.indexOf(item);
      itemArr.splice(id, 1);
    }
  }

  return itemArr;
}
