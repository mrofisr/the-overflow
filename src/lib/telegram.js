import { LogFormatter } from "@/lib/log.js";

const SendTelegram = async (
  client,
  user_telegram_token,
  user_telegram_chat_id,
) => {
  try {
    const query = `
      SELECT item_id, item_title, item_link
      FROM rss_items
      WHERE item_telegram_sent = false
      ORDER BY item_pubdate DESC
      LIMIT 25;
    `;
    const items = await client.query(query, []);

    for (const item of items.rows) {
      const { item_id, item_title, item_link } = item;

      const message = `📰 *${item_title}*. [Read more..](${item_link})`;
      const url = `https://api.telegram.org/bot${user_telegram_token}/sendMessage`;

      const body = {
        chat_id: user_telegram_chat_id,
        text: message,
        parse_mode: "Markdown",
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const updateQuery = `
            UPDATE rss_items SET item_telegram_sent = $1
            WHERE item_id = $2;
          `;
          const updateValues = [true, item_id];
          await client.query(updateQuery, updateValues);

          console.info(
            LogFormatter(
              "INFO",
              `Telegram message sent: ${item_title}`,
              "SendTelegram",
            ),
          );
        } else {
          console.error(
            LogFormatter(
              "ERROR",
              `Failed to send Telegram message: ${item_title}, Response status: ${response.status}`,
              "SendTelegram",
            ),
          );
        }
      } catch (error) {
        console.error(
          LogFormatter(
            "ERROR",
            `Error sending Telegram message: ${error.message}`,
            "SendTelegram",
          ),
        );
        throw error;
      }
    }
  } catch (error) {
    console.error(
      LogFormatter(
        "ERROR",
        `Error sending Telegram message: ${error.message}`,
        "SendTelegram",
      ),
    );
    throw error;
  }
};

export { SendTelegram };
