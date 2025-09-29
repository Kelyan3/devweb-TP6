import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs/promises";
import path from "path";
import { DB_FILE, DB_SCHEMA, DIRNAME } from "../config.mjs";

let dbConnect;

export async function initiateDatabase() {
    const dbPath = path.join(DIRNAME, DB_FILE);
    const dbSchemaPath = path.join(DIRNAME, DB_SCHEMA);
    dbConnect = await open({ filename: dbPath, driver: sqlite3.Database });
    const sqlRequest = await fs.readFile(dbSchemaPath, "utf8");
    await dbConnect.exec(sqlRequest);
    return dbConnect;
}

export function getDb() {
    return dbConnect;
}
export async function getLinkByShortUrl(shortUrl) {
    return getDb().get("SELECT * FROM links WHERE shortUrl = ?", shortUrl);
}
export async function incrementVisit(shortUrl) {
    await getDb().run("UPDATE links SET visit = visit + 1 WHERE shortUrl = ?", shortUrl);
}
export async function getVisitCount(shortUrl) {
    const row = await getDb().get("SELECT visit FROM links WHERE shortUrl = ?", shortUrl);
    return row ? row.visit : null;
}
