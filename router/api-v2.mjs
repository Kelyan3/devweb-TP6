import express from "express";
import { getDb, getLinkByShortUrl, incrementVisit } from "../database/database.mjs";
import { LINK_LEN } from "../config.mjs";
import path from "path";

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
        response.format({
            "application/json": () => response.json(result),
            "text/html": () => response.render("root", { nb_links: result.nb_links }),
            default: () => response.status(406).send("Not Acceptable")
        });
    } catch (error) {
        response.status(500).send("Internal Server Error");
    }
});

function generateSecretKey(len) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

router.post("/", async (request, response) => {
    const { url } = request.body;
    if (!url || typeof url !== "string")
        return response.format({
            "application/json": () => response.status(400).json({ error: "L'URL doit être une chaîne de caractères valide." }),
            "text/html": () => response.status(400).send("URL invalide"),
            default: () => response.status(406).send("Not Acceptable")
        });

    try {
        let shortURL = "";
        let found = true;
        while (found) {
            shortURL = generateShortURL(LINK_LEN);
            const result = await getDb().get("SELECT 1 FROM links WHERE shortUrl = ?", shortURL);
            found = !!result;
        }
        const createdAt = new Date().toUTCString();
        const secretKey = generateSecretKey(LINK_LEN);
        const info = await getDb().run("INSERT INTO links (shortUrl, longUrl, createdAt, visit, secretKey) VALUES (?, ?, ?, 0, ?)", shortURL, url, createdAt, secretKey)
        const host = request.get("host");
        const baseUrl = `${request.protocol}://${host}/api-v2/`;
        const fullShortUrl = baseUrl + shortURL;
        response.format({
            "application/json": () => response.status(201).json({
                short_url: shortURL,
                long_url: url,
                created_at: createdAt,
                idLink: info.lastID,
                secretKey
            }),
            "text/html": () => response.render("created", {
                short_url: shortURL,
                full_short_url: fullShortUrl,
                long_url: url,
                created_at: createdAt
            }),
            default: () => response.status(406).send("Not Acceptable")
        });
    } catch (error) {
        response.status(500).send("Internal Server Error");
    }
});

router.get("/:url", async (request, response) => {
    try {
        const shortUrl = request.params.url;
        const link = await getLinkByShortUrl(shortUrl);
        if (!link) {
            return response.format({
                "application/json": () => response.status(404).json({ error: "Lien non trouvé" }),
                "text/html": () => response.status(404).send("Lien non trouvé"),
                default: () => response.status(406).send("Not Acceptable")
            });
        }
        response.format({
            "application/json": () => response.json({ short_url: shortUrl, visit: link.visit, long_url: link.longUrl }),
            "text/html": async () => {
                await incrementVisit(shortUrl);
                response.redirect(link.longUrl);
            },
            default: () => response.status(406).send("Not Acceptable")
        });
    } catch (error) {
        response.status(500).send("Internal Server Error");
    }
});

router.delete("/:url", async (request, response) => {
    const shortUrl = request.params.url;
    const link = await getLinkByShortUrl(shortUrl);
    if (!link)
        return response.status(404).json({ error: "Lien non trouvé" });

    const apiKey = request.header("X-API-KEY");
    if (!apiKey)
        return response.status(401).json({ error: "Clé API manquante" });
    if (apiKey !== link.secretKey)
        return response.status(403).json({ error: "Clé API incorrecte" });

    await getDb().run("DELETE FROM links WHERE shortUrl = ?", shortUrl);
    response.status(200).json({ message: "Lien supprimé" });
})

export default router;
