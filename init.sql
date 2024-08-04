CREATE TABLE IF NOT EXISTS items (
    id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    link TEXT UNIQUE NOT NULL,
    published TIMESTAMP NOT NULL,
    telegram_sent BOOLEAN DEFAULT FALSE
);
