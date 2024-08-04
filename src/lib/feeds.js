import { LogFormatter } from "@/lib/log.js";
import { extractFromXml } from "@extractus/feed-extractor";
import { extractFromHtml } from "@extractus/article-extractor";

const FeedsFinder = async (url) => {
  const paths = [
    "/feed",
    "/rss",
    "/rss.xml",
    "/atom",
    "/atom.xml",
    "/rssfeed",
    "/feeds/posts/default",
    "/category/feed",
    "/comments/feed",
    "/news/feed",
    "/blog/feed",
    "/blog/feed.xml",
    "/articles/feed",
    "/posts/feed",
    "/updates/feed",
    "/index.xml",
    "/index.rss",
    "/index.atom",
    "/index.rdf",
    "/?feed=rss",
    "/?feed=atom",
    "/?format=rss",
    "/?format=xml",
    "/syndication.axd",
    "/feed/rss",
    "/feed/atom",
    "/feed.xml",
    "/rssfeed.xml",
    "/rss/all",
    "/rss/news",
    "/rss/posts",
    "/rss/latest",
    "/rss/updates",
    "/rss/news.xml",
    "/rss/posts.xml",
    "/rss/latest.xml",
    "/rss/updates.xml",
  ];
  try {
    for (const path of paths) {
      const urlFeed = `${url}${path}`;
      const resp = await fetch(urlFeed);
      if (
        resp.status === 200 &&
        resp.headers.get("Content-Type").includes("xml")
      ) {
        const title = extractFromXml(await resp.text()).title;
        console.info(
          LogFormatter("INFO", `Found feed at ${urlFeed}`, "FeedsFinder"),
        );
        return { url: urlFeed, title: title };
      } else {
        console.error(
          LogFormatter("ERROR", `No feed found at ${urlFeed}`, "FeedsFinder"),
        );
      }
    }
  } catch (error) {
    console.error(
      LogFormatter(
        "ERROR",
        `Error fetching feeds: ${error.message}`,
        "FeedsFinder",
      ),
    );
    throw error;
  }
};
const GetFeedData = async (entries) => {
  try {
    var data = [];
    for (const entry of entries) {
      const html = await fetch(entry.link);
      const metadata = extractFromHtml(await html.text());
      data.push({
        id: entry.id,
        title: entry.title,
        favicon: metadata?.favicon,
        description: metadata?.description,
        content: metadata?.content,
        image: metadata?.image,
        author: metadata?.author,
        link: entry?.link,
        published: metadata?.published,
        ttr: metadata?.ttr,
      });
    }
    return data;
  } catch (error) {
    console.error(
      LogFormatter(
        "ERROR",
        `Error fetching feeds: ${error.message}`,
        "GetFeedData",
      ),
    );
    throw error;
  }
};

export { FeedsFinder, GetFeedData };
