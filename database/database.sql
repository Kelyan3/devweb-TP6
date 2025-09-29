-- database: :memory:
CREATE TABLE IF NOT EXISTS links (
    idLinks INTEGER PRIMARY KEY AUTOINCREMENT,
    shortUrl TEXT UNIQUE NOT NULL,
    longUrl TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    visit INTEGER DEFAULT 0,
    secretKey TEXT UNIQUE
);
