import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { client } from "@/lib/database";
import {
  AddRssFeed,
  GetAllRssFeeds,
  GetAllRssItems,
  GetLastUpdated,
  GetRssFeedById,
  GetRssItemsByRssId,
  UpdateRssItems,
  GetRssItemsById,
  GetRssItemsByTitle,
  DeleteAllRssFeeds,
  DeleteAllRssItems,
  DeleteRssFeedById,
  DeleteRssItemsById,
  DeleteRssItemsByRssId,
} from "@/repository/feeds.js";
import { FeedsFinder, GetFeedData } from "@/lib/feeds";
import { SendTelegram } from "@/lib/telegram";
import { extractFromXml } from "@extractus/feed-extractor";

const app = new Hono();

app.use(prettyJSON());
app.use(
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
  }),
);
app.get("/", (c) => {
  c.status(200);
  return c.json({ message: "Welcome to the RSS Rest API" });
});
app.get("/ping", async (c) => {
  try {
    const status = await client(c.env.DATABASE_URL);
    if (status) {
      c.status(200);
      return c.json({ message: "pong" });
    }
  } catch (error) {
    c.status(500);
    return c.json({ error: error.message });
  }
});
app.get("/find-feed", async (c) => {
  try {
    const url = c.req.query("url");
    if (url === undefined) {
      c.status(400);
      return c.json({ error: "Missing 'url' query parameter" });
    }
    const data = await FeedsFinder(url);
    c.status(200);
    return c.json(data);
  } catch (error) {
    c.status(500);
    return c.json({ error: error.message });
  }
});
app.get("/scrape", async (c) => {
  try {
    const url = c.req.query("url");
    if (url === undefined) {
      c.status(400);
      return c.json({ error: "Missing 'url' query parameter" });
    }
    const resp = await fetch(url);
    const data = await resp.text();
    const entries = extractFromXml(data, {
      useISODateFormat: true,
    }).entries;
    c.status(200);
    return c.json(entries);
  } catch (error) {
    c.status(500);
    return c.json({ error: error.message });
  }
});
app.get("/hook", async (c) => {
  try {
    await UpdateRssItems(await client(c.env.DATABASE_URL));
    c.status(200);
    return c.json({ message: "RSS Items updated" });
  } catch (error) {
    c.status(500);
    return c.json({ error: error.message });
  }
});
app.get("/send", async (c) => {
  try {
    await SendTelegram(
      await client(c.env.DATABASE_URL),
      c.env.TELEGRAM_BOT_TOKEN,
      c.env.TELEGRAM_CHAT_ID,
    );
    c.status(200);
    return c.json({ message: "Sent to Telegram" });
  } catch (error) {
    c.status(500);
    return c.json({ error: error.message });
  }
});
app.get("/items", async (c) => {
  try {
    const data = await GetAllRssItems(await client(c.env.DATABASE_URL));
    c.status(200);
    return c.json(data);
  } catch (error) {
    c.status(500);
    return c.json({ error: error.message });
  }
});
app.delete("/items", async (c) => {
  try {
    const dbClient = await client(c.env.DATABASE_URL);
    await DeleteAllRssItems(dbClient);
    c.status(200);
    return c.json({ message: "All RSS items deleted" });
  } catch (error) {
    c.status(500);
    return c.json({ error: error.message });
  }
});
app.delete("/item", async (c) => {
  try {
    const rss_id = c.req.query("rss_id");
    const item_id = c.req.query("item_id");
    if (!rss_id && !item_id) {
      c.status(400);
      return c.json({ error: "Missing query parameter" });
    }
    const dbClient = await client(c.env.DATABASE_URL);
    if (rss_id) {
      await DeleteRssItemsByRssId(dbClient, rss_id);
    } else if (item_id) {
      await DeleteRssItemsById(dbClient, item_id);
    }
    c.status(200);
    return c.json({ message: "RSS item deleted" });
  } catch (error) {
    c.status(500);
    return c.json({ error: error.message });
  }
});
app.get("/item", async (c) => {
  try {
    const rss_id = c.req.query("rss_id");
    const limitParam = c.req.query("limit");
    const item_id = c.req.query("item_id");
    const title = c.req.query("title");

    if (!rss_id && !item_id && !title) {
      c.status(400);
      return c.json({ error: "Missing query parameter" });
    }

    const limit = typeof limitParam === "string" ? limitParam : "10"; // Use "10" as default if limitParam is not a string

    const dbClient = await client(c.env.DATABASE_URL);
    let data = [];

    if (rss_id) {
      data = await GetRssItemsByRssId(dbClient, rss_id, limit);
    } else if (item_id) {
      data = await GetRssItemsById(dbClient, item_id, limit);
    } else if (title) {
      data = await GetRssItemsByTitle(dbClient, title, limit);
    }

    if (data.length === 0) {
      c.status(404);
      return c.json({ error: "RSS item not found" });
    }

    const lastUpdated = await GetLastUpdated(dbClient, rss_id);

    if (lastUpdated.length > 0) {
      c.header("Last-Updated", lastUpdated[0].last_published || "");
    }

    c.status(200);
    return c.json(data);
  } catch (error) {
    c.status(500);
    return c.json({ error: error.message });
  }
});
app.get("/feeds", async (c) => {
  try {
    const data = await GetAllRssFeeds(await client(c.env.DATABASE_URL));
    c.status(200);
    return c.json(data);
  } catch (error) {
    c.status(500);
    return c.json({ error: error.message });
  }
});
app.get("/feed", async (c) => {
  try {
    const rss_id = c.req.query("rss_id");
    if (rss_id === undefined) {
      c.status(400);
      return c.json({ error: "Missing 'rss_id' query parameter" });
    }
    const data = await GetRssFeedById(await client(c.env.DATABASE_URL), rss_id);
    const lastUpdated = await GetLastUpdated(
      await client(c.env.DATABASE_URL),
      rss_id,
    );
    if (lastUpdated.length === 0) {
      c.status(404);
      return c.json({ error: "RSS feed not found" });
    }
    c.header("Last-Updated", lastUpdated[0].last_published);
    c.status(200);
    return c.json(data);
  } catch (error) {
    c.status(500);
    return c.json({ error: error.message });
  }
});
app.post("/feed", async (c) => {
  try {
    const requestBody = await c.req.json();
    const rss_url = requestBody.rss_url;
    const rss_title = requestBody.rss_title;
    await AddRssFeed(await client(c.env.DATABASE_URL), rss_url, rss_title);
    c.status(200);
    return c.json({ message: "Feed added" });
  } catch (error) {
    c.status(500);
    return c.json({ error: error.message });
  }
});
app.delete("/feeds", async (c) => {
  try {
    await DeleteAllRssFeeds(await client(c.env.DATABASE_URL));
    c.status(200);
    return c.json({ message: "All RSS feeds deleted" });
  } catch (error) {
    c.status(500);
    return c.json({ error: error.message });
  }
});
app.delete("/feed", async (c) => {
  try {
    const rss_id = c.req.query("rss_id");
    if (rss_id === undefined) {
      c.status(400);
      return c.json({ error: "Missing 'rss_id' query parameter" });
    }
    await DeleteRssFeedById(await client(c.env.DATABASE_URL), rss_id);
    c.status(200);
    return c.json({ message: "RSS feed deleted" });
  } catch (error) {
    c.status(500);
    return c.json({ error: error.message });
  }
});
app.use((c) => {
  c.status(404);
  return c.json({ error: "Not found" });
});
export default {
  async fetch(request, env, ctx) {
    return app.fetch(request, env, ctx); // Delegate to the Hono app
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(await UpdateRssItems(await client(env.DATABASE_URL)));
    // ctx.waitUntil(
    //   await SendTelegram(
    //     await client(env.DATABASE_URL),
    //     env.TELEGRAM_BOT_TOKEN,
    //     env.TELEGRAM_CHAT_ID,
    //   ),
    // );
  },
};
