import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { client } from "@/lib/database";
import { UpdateItems } from "@/repository/feeds.js";
import { SendTelegram } from "@/lib/telegram";

const app = new Hono();
app.use(prettyJSON());
app.use(
  cors({
    origin: "*",
    allowMethods: ["GET"],
  }),
);
app.get("/", (c) => {
  c.status(200);
  return c.json({ message: "assalamu'alaikum" });
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
app.get("/hook", async (c) => {
  try {
    await UpdateItems(await client(c.env.DATABASE_URL), c.env.RSS_URL);
    c.status(201);
    return c.json({ message: "items updated" });
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
    return c.json({ message: "sent to telegram" });
  } catch (error) {
    c.status(500);
    return c.json({ error: error.message });
  }
});
export default {
  async fetch(request, env, ctx) {
    return app.fetch(request, env, ctx); // Delegate to the Hono app
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      await UpdateItems(await client(env.DATABASE_URL), env.RSS_URL),
    );
    ctx.waitUntil(
      await SendTelegram(
        await client(env.DATABASE_URL),
        env.TELEGRAM_BOT_TOKEN,
        env.TELEGRAM_CHAT_ID,
      ),
    );
  },
};
