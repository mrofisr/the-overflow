import { LogFormatter } from "@/lib/log.js";
import { extractFromXml } from "@extractus/feed-extractor";

const UpdateItems = async (client, rss_url) => {
  try {
    const resp = await fetch(rss_url);
    if (
      resp.status === 200 &&
      resp.headers.get("Content-Type").includes("xml")
    ) {
      const xml = await resp.text();
      const items = extractFromXml(xml, {
        useISODateFormat: true,
      }).entries;
      for (const item of items) {
        const { title, link, description, published } = item;
        const insertQuery = `
          INSERT INTO items (
              title,
              description,
              link,
              published,
              telegram_sent
          ) VALUES ($1, $2, $3, $4, false)
          ON CONFLICT (link) DO NOTHING;
          `;
        const values = [title, description, link, published];
        await client.query(insertQuery, values);
      }
    }
    await client.query("COMMIT");
    console.info(
      LogFormatter("INFO", "RSS items updated successfully.", "UpdateRssItems"),
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(
      LogFormatter(
        "ERROR",
        `Error updating RSS items: ${error.message}`,
        "UpdateRssItems",
      ),
    );
    throw error;
  }
};
export { UpdateItems };
