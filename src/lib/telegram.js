import { LogFormatter } from "@/lib/log.js";

const SendTelegram = async (client, token, chat_id) => {
  try {
    const query = `
      SELECT title, link
      FROM items
      WHERE telegram_sent = false
      ORDER BY published DESC
      LIMIT 25;
    `;
    const items = await client.query(query, []);
    for (const item of items.rows) {
      const { title, link } = item;
      const message = `📰 *${title}*. [Read more..](${link})`;
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const body = {
        chat_id: chat_id,
        text: message,
        parse_mode: "Markdown",
      };
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify(body),
      });
    }
    const updateQuery = `
      UPDATE items SET telegram_sent = true
      WHERE telegram_sent = false;
    `;
    await client.query(updateQuery, []);
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
