import express from "express";
import { getDb, getLinkByShortUrl, incrementVisit, getVisitCount } from "../database/database.mjs";
import { LINK_LEN } from "../config.mjs";

const router = express.Router();

const generateShortURL = (len) => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < len; i++)
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
}

router.get("/", async (request, response) => {
    try {
        const result = await getDb().get("SELECT COUNT(*) AS nb_links FROM links");
        response.json(result);
    } catch (error) {
        response.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/", async (request, response) => {
    const { url } = request.body;
    if (!url || typeof url !== "string")
        return request.status(400).json({ error: "L'URL doit être une chaîne de caractères valide." });

    try {
        let shortURL = "";
        let found = true;
        while (found) {
            shortURL = generateShortURL(LINK_LEN);
            const result = await getDb().get("SELECT 1 FROM links WHERE shortUrl = ?", shortURL);
            found = !!result;
        }
        const createdAt = new Date().toISOString();
        const info = await getDb().run("INSERT INTO links (shortUrl, longUrl, createdAt, visit) VALUES (?, ?, ?, 0)", shortURL, url, createdAt);
        response.status(201).json({
            short_url: shortURL,
            long_url: url,
            created_at: createdAt,
            idLink: info.lastID
        });
    } catch (error) {
        response.status(500).json({ error: "Erreur de création du lien." });
    }
});

router.get("/:url", async (request, response) => {
    try {
        const shortUrl = request.params.url;
        const link = await getLinkByShortUrl(shortUrl);
        console.log(link);
        if (!link)
            return response.status(404).json({ error: "Lien non trouvé" });
        await incrementVisit(shortUrl);
        response.redirect(link.longUrl);
    } catch (error) {
        next(error);
    }
});

router.get("/status/:url", async (request, response) => {
    try {
        const shortUrl = request.params.url;
        const link = await getLinkByShortUrl(shortUrl);
        if (!link)
            return response.status(404).json({ error: "Lien non trouvé" });
        response.json({ short_url: shortUrl, visit: link.visit });
    } catch (error) {
        next(error);
    }
});

export default router;