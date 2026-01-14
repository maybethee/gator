import { XMLParser } from "fast-xml-parser";
import { exit } from "node:process";
import { feedsOnUsers, type Feed } from "src/lib/db/queries/feeds";

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

export async function handlerAgg(cmdName: string) {
  const xmlData = await fetchFeed("http://www.wagslane.dev/index.xml");

  const stringifiedData = JSON.stringify(xmlData);
  console.log(stringifiedData);
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

  console.log("is it now an array:", Array.isArray(items));

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

export async function handlerFeeds() {
  const allFeeds = await feedsOnUsers();

  for (const feeds of allFeeds) {
    console.log(`Name: ${feeds.feeds.name}`);
    console.log(`url: ${feeds.feeds.url}`);
    console.log(`User: ${feeds.users.name}`);
  }
}
