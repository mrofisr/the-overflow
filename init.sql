-- Create rss_feeds table
CREATE TABLE IF NOT EXISTS rss_feeds (
    rss_id SERIAL PRIMARY KEY,
    rss_title TEXT NOT NULL,
    rss_url TEXT UNIQUE NOT NULL,
    last_published TIMESTAMP
);

-- Create rss_items table
CREATE TABLE IF NOT EXISTS rss_items (
    item_id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(),
    rss_id INTEGER REFERENCES rss_feeds(rss_id) ON DELETE CASCADE,
    item_title TEXT NOT NULL,
    item_favicon TEXT,
    item_description TEXT NOT NULL,
    item_content TEXT,
    item_image TEXT,
    item_author TEXT NOT NULL,
    item_link TEXT UNIQUE NOT NULL,
    item_published TIMESTAMP NOT NULL,
    item_ttr INT DEFAULT 0,
    item_telegram_sent BOOLEAN DEFAULT FALSE
);
