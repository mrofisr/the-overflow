import { LogFormatter } from "@/lib/log.js";
import { GetFeedData } from "@/lib/feeds";
import { extractFromXml } from "@extractus/feed-extractor";

const GetAllRssFeeds = async (client) => {
  try {
    const query = `SELECT * FROM rss_feeds;`;
    const result = await client.query(query, []);
    console.info(
      LogFormatter(
        "INFO",
        "All RSS feeds fetched successfully.",
        "GetAllRssFeeds",
      ),
    );
    const updateResult = result.rows.map((item) => {
      return {
        id: item.rss_id,
        url: item.rss_url,
        title: item.rss_title,
        last_published: item.last_published,
      };
    });
    return updateResult;
  } catch (error) {
    console.error(
      LogFormatter(
        "ERROR",
        `Error fetching all RSS feeds: ${error.message}`,
        "GetAllRssFeeds",
      ),
    );
    throw error;
  }
};
const GetRssFeedById = async (client, rss_id) => {
  try {
    const query = `
      SELECT * FROM rss_feeds
      WHERE rss_id = $1;
    `;
    const values = [rss_id];
    const result = await client.query(query, values);
    const updateResult = result.rows.map((item) => {
      return {
        id: item.rss_id,
        url: item.rss_url,
        title: item.rss_title,
        last_published: item.last_published,
      };
    });
    console.info(
      LogFormatter(
        "INFO",
        "RSS feed fetched by ID successfully.",
        "GetRssFeedById",
      ),
    );
    return updateResult;
  } catch (error) {
    console.error(
      LogFormatter(
        "ERROR",
        `Error fetching RSS feed by ID: ${error.message}`,
        "GetRssFeedById",
      ),
    );
    throw error;
  }
};
const DeleteAllRssFeeds = async (client) => {
  try {
    const query = `DELETE FROM rss_feeds;`;
    console.info(
      LogFormatter("INFO", "Deleting all RSS feeds.", "DeleteAllRssFeeds"),
    );
    await client.query(query, []);
  } catch (error) {
    console.error(
      LogFormatter(
        "ERROR",
        `Error deleting all RSS feeds: ${error.message}`,
        "DeleteAllRssFeeds",
      ),
    );
    throw error;
  }
};
const DeleteRssFeedById = async (client, rss_id) => {
  try {
    const query = `
      DELETE FROM rss_feeds
      WHERE rss_id = $1;
    `;
    const values = [rss_id];
    console.info(
      LogFormatter(
        "INFO",
        `Deleting RSS feed by ID: ${rss_id}`,
        "DeleteRssFeedById",
      ),
    );
    await client.query(query, values);
  } catch (error) {
    console.error(
      LogFormatter(
        "ERROR",
        `Error deleting RSS feed by ID: ${error.message}`,
        "DeleteRssFeedById",
      ),
    );
    throw error;
  }
};
const AddRssFeed = async (client, url, title) => {
  try {
    const query = `
      INSERT INTO rss_feeds (rss_url, rss_title)
      VALUES ($1,$2)
      ON CONFLICT (rss_url) DO NOTHING;
    `;
    const values = [url, title];
    console.info(LogFormatter("INFO", `Adding RSS feed: ${url}`, "AddRssFeed"));
    await client.query(query, values);
  } catch (error) {
    console.error(
      LogFormatter(
        "ERROR",
        `Error adding RSS feed: ${error.message}`,
        "AddRssFeed",
      ),
    );
    throw error;
  }
};
const GetAllRssItems = async (client) => {
  try {
    const query = `
      SELECT * FROM rss_items
      ORDER BY item_pubdate DESC;
    `;
    const result = await client.query(query, []);
    console.info(
      LogFormatter(
        "INFO",
        "All RSS items fetched successfully.",
        "GetAllRssItems",
      ),
    );
    return result.rows;
  } catch (error) {
    console.error(
      LogFormatter(
        "ERROR",
        `Error fetching all RSS items: ${error.message}`,
        "GetAllRssItems",
      ),
    );
    throw error;
  }
};
const GetRssItemsById = async (client, item_id, limit) => {
  try {
    const query = `
      SELECT * FROM rss_items
      WHERE item_id = $1
      LIMIT $2;
    `;
    const values = [item_id, limit];
    const result = await client.query(query, values);
    console.info(
      LogFormatter(
        "INFO",
        `Fetching RSS items by ID: ${item_id}`,
        "GetRssItemsById",
      ),
    );
    return result.rows[0];
  } catch (error) {
    console.error(
      LogFormatter(
        "ERROR",
        `Error fetching RSS items by ID: ${error.message}`,
        "GetRssItemsById",
      ),
    );
    throw error;
  }
};
const GetRssItemsByRssId = async (client, rss_id, limit) => {
  try {
    const query = `
      SELECT * FROM rss_items
      WHERE rss_id = $1
      ORDER BY item_pubdate DESC
      LIMIT $2;
    `;
    const values = [rss_id, limit];
    const result = await client.query(query, values);
    console.info(
      LogFormatter(
        "INFO",
        `Fetching RSS items by ID: ${rss_id}`,
        "GetRssItemsByRssId",
      ),
    );
    return result.rows;
  } catch (error) {
    console.error(
      LogFormatter(
        "ERROR",
        `Error fetching RSS items by ID: ${error.message}`,
        "GetRssItemsByRssId",
      ),
    );
    throw error;
  }
};
const GetRssItemsByTelegramSent = async (client, telegram_sent, limit) => {
  try {
    const query = `
      SELECT * FROM rss_items
      WHERE telegram_sent = $1
      LIMIT $2;
    `;
    const values = [telegram_sent, limit];
    const result = await client.query(query, values);
    console.info(
      LogFormatter(
        "INFO",
        `Fetching RSS items by Telegram sent: ${telegram_sent}`,
        "GetRssItemsByTelegramSent",
      ),
    );
    return result.rows;
  } catch (error) {
    console.error(
      LogFormatter(
        "ERROR",
        `Error fetching RSS items by Telegram sent: ${error.message}`,
        "GetRssItemsByTelegramSent",
      ),
    );
    throw error;
  }
};
const GetRssItemsByTitle = async (client, title, limit) => {
  try {
    const query = `
      SELECT * FROM rss_items
      WHERE item_title ILIKE $1
      LIMIT $2;
    `;
    const values = [`%${title}%`, limit];
    const result = await client.query(query, values);
    console.info(
      LogFormatter(
        "INFO",
        `Fetching RSS items by title: ${title}`,
        "GetRssItemsByTitle",
      ),
    );
    return result.rows;
  } catch (error) {
    console.error(
      LogFormatter(
        "ERROR",
        `Error fetching RSS items by title: ${error.message}`,
        "GetRssItemsByTitle",
      ),
    );
    throw error;
  }
};
const UpdateRssItems = async (client) => {
  try {
    await client.query("BEGIN");
    const rssFeedsQuery =
      "SELECT rss_id, rss_url, last_published FROM rss_feeds";
    const rssFeedsResult = await client.query(rssFeedsQuery);
    if (rssFeedsResult.rows.length === 0) {
      throw new Error("No RSS feeds found in the database");
    }

    for (const feed of rssFeedsResult.rows) {
      const { rss_id, rss_url, last_published } = feed;
      const resp = await fetch(rss_url);
      if (
        resp.status === 200 &&
        resp.headers.get("Content-Type").includes("xml")
      ) {
        const xmlText = await resp.text();
        const entries = extractFromXml(xmlText, {
          useISODateFormat: true,
        }).entries;

        if (!entries || entries.length === 0) {
          console.info(
            LogFormatter(
              "INFO",
              `No entries found in RSS feed: ${rss_url}`,
              "UpdateRssItems",
            ),
          );
          continue;
        }

        const firstEntryPublished = entries[0]?.published;
        if (!firstEntryPublished) {
          console.warn(
            LogFormatter(
              "WARN",
              `No published date found in the first entry of RSS feed: ${rss_url}`,
              "UpdateRssItems",
            ),
          );
          continue;
        }

        if (
          new Date(firstEntryPublished).toISOString() ===
          new Date(
            new Date(last_published).getTime() + 7 * 60 * 60 * 1000,
          ).toISOString()
        ) {
          console.info(
            LogFormatter(
              "INFO",
              `No new items found for RSS feed: ${rss_url}`,
              "UpdateRssItems",
            ),
          );
          continue;
        }
        const newItems = entries.filter(
          (entry) =>
            new Date(entry.published).toISOString() >
            new Date(
              new Date(last_published).getTime() + 7 * 60 * 60 * 1000,
            ).toISOString(),
        );
        if (newItems.length === 0) {
          console.info(
            LogFormatter(
              "INFO",
              `No new items to update for RSS feed: ${rss_url}`,
              "UpdateRssItems",
            ),
          );
          continue;
        }

        const items = await GetFeedData(newItems);
        for (const item of items) {
          const { title, link, published, description, image, author } = item;
          const insertQuery = `
          INSERT INTO rss_items (
              rss_id,
              item_title,
              item_description,
              item_image,
              item_author,
              item_link,
              item_pubdate,
              item_telegram_sent
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, false)
          ON CONFLICT (item_link) DO NOTHING;
          `;
          const values = [
            rss_id,
            title,
            description,
            image,
            author,
            link,
            published,
          ];
          await client.query(insertQuery, values);
        }

        const lastUpdatedQuery = `
        UPDATE rss_feeds
        SET last_published = $1
        WHERE rss_id = $2
        `;
        const lastUpdatedValues = [items[0].published, rss_id];
        await client.query(lastUpdatedQuery, lastUpdatedValues);
      }
      await client.query("COMMIT");
      console.info(
        LogFormatter(
          "INFO",
          "RSS items updated successfully.",
          "UpdateRssItems",
        ),
      );
    }
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

const DeleteAllRssItems = async (client) => {
  try {
    const query = "DELETE FROM rss_items";
    await client.query(query, []);
    console.info(
      LogFormatter("INFO", "Deleted all RSS items.", "DeleteAllRssItems"),
    );
  } catch (error) {
    console.error(
      LogFormatter(
        "ERROR",
        `Error deleting all RSS items: ${error.message} `,
        "DeleteAllRssItems",
      ),
    );
    throw error;
  }
};
const DeleteRssItemsByRssId = async (client, rss_id) => {
  try {
    const query = "DELETE FROM rss_items WHERE rss_id = $1";
    const values = [rss_id];
    await client.query(query, values);
    console.info(
      LogFormatter(
        "INFO",
        `Deleted RSS items by ID: ${rss_id} `,
        "DeleteRssItemsByRssId",
      ),
    );
  } catch (error) {
    console.error(
      LogFormatter(
        "ERROR",
        `Error deleting RSS items by ID: ${error.message} `,
        "DeleteRssItemsByRssId",
      ),
    );
    throw error;
  }
};
const DeleteRssItemsById = async (client, item_id) => {
  try {
    const query = "DELETE FROM rss_items WHERE item_id = $1";
    const values = [item_id];
    await client.query(query, values);
    console.info(
      LogFormatter(
        "INFO",
        `Deleted RSS items by ID: ${item_id} `,
        "DeleteRssItemsById",
      ),
    );
  } catch (error) {
    console.error(
      LogFormatter(
        "ERROR",
        `Error deleting RSS items by ID: ${error.message} `,
        "DeleteRssItemsById",
      ),
    );
    throw error;
  }
};
const GetLastUpdated = async (client, rss_id) => {
  try {
    const query = `
      SELECT rss_id, last_published FROM rss_feeds WHERE last_published IS NOT NULL AND rss_id = $1;
        `;
    const values = [rss_id];
    const result = await client.query(query, values);
    console.info(
      LogFormatter(
        "INFO",
        `Fetching last updated date for RSS feed: ${rss_id} `,
        "GetLastUpdated",
      ),
    );
    return result.rows;
  } catch (error) {
    console.error(
      LogFormatter(
        "ERROR",
        `Error fetching last updated date: ${error.message} `,
        "GetLastUpdated",
      ),
    );
    throw error;
  }
};
export {
  GetAllRssFeeds,
  GetRssFeedById,
  AddRssFeed,
  GetAllRssItems,
  GetRssItemsByRssId,
  UpdateRssItems,
  GetLastUpdated,
  GetRssItemsById,
  GetRssItemsByTelegramSent,
  GetRssItemsByTitle,
  DeleteAllRssFeeds,
  DeleteRssFeedById,
  DeleteAllRssItems,
  DeleteRssItemsByRssId,
  DeleteRssItemsById,
};
