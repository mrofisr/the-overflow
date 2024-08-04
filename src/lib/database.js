import { Client } from "@neondatabase/serverless";
import { LogFormatter } from "@/lib/log.js";

const client = async (database_url) => {
  try {
    const client = new Client({
      keepAlive: true,
      connectionTimeoutMillis: 5000,
      connectionString: database_url,
    });
    client.setMaxListeners(5);
    await client.connect();
    console.info(
      LogFormatter(
        "INFO",
        "Database connection established successfully.",
        "client",
      ),
    );
    return client;
  } catch (error) {
    console.error(
      LogFormatter(
        "ERROR",
        `Error establishing database connection: ${error.message}`,
        "client",
      ),
    );
    throw error;
  }
};

export { client };
