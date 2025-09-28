import express, { response } from "express";
import dotenv from "dotenv";
import sqlite3 from "sqlite3";
import { open } from 'sqlite';
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import favicon from 'serve-favicon';

import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

dotenv.config();

const _fileName = fileURLToPath(import.meta.url);
const _directoryName = path.dirname(_fileName);

const HOST = "localhost";
const PORT = process.env.PORT;
const LINK_LEN = process.env.LINK_LEN;
const DB_FILE = process.env.DB_FILE;
const DB_SCHEMA = process.env.DB_SCHEMA;

const swaggerPath = path.join(_directoryName, "static", "open-api.yml");
let swaggerDoc;
try {
    swaggerDoc = YAML.load(swaggerPath);
} catch (error) {
    console.error("Erreur chargement YAML");
}


const app = express();
app.use(express.static("static"));
app.use(express.json());
app.use(favicon(path.join(_directoryName, "static", "logo_univ_16.png")));

app.disable("x-powered-by");

if (swaggerDoc) {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
}

let dbConnect; // Stockage de la connexion à la base de données.

const generateShortURL = (len) => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < len; i++)
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
}

async function initiateDatabase() {
    try {
        const dbPath = path.join(_directoryName, DB_FILE);
        const dbSchemaPath = path.join(_directoryName, DB_SCHEMA);
        dbConnect = await open({ filename: dbPath, driver: sqlite3.Database });
        console.log(`Connexion à la base de données SQLite réussi (${dbPath})`);

        const sqlRequest = await fs.readFile(dbSchemaPath, "utf8");
        await dbConnect.exec(sqlRequest);
        console.log(`Vérification et application du schéma de la base de données OK.`);
    } catch (error) {
        console.error(`La connnexion lors de l'initialisation de la DB à échoué : ${error.message}`);
        process.exit(1);
    }
}

app.get("/api-v1/", async (request, response) => {
    try {
        const result = await dbConnect.get("SELECT COUNT(*) AS nb_links FROM links");
        response.json(result);
    } catch (error) {
        console.error(`Error GET /api-v1/: ${error.message}`);
        response.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/api-v1/", async (request, response) => {
    const { url } = request.body;
    if (!url || typeof url !== 'string')
        return response.status(400).json({ error: "L'URL doit être une chaîne de caractères valide."});
    
    try {
        let shortURL = "";
        let found = true;
        while (found) {
            shortURL = generateShortURL(LINK_LEN);
            const result = await dbConnect.get("SELECT 1 FROM links WHERE shortUrl = ?", shortURL);
            found = !!result; // Conversion en booléen afin de déterminer si un résultat est trouvé.
        }

        const createdAt = new Date().toISOString();
        const info = await dbConnect.run("INSERT INTO links (shortUrl, longUrl, createdAt) VALUES (?, ?, ?)", shortURL, url, createdAt);
        response.status(201).json({
            short_url: shortURL,
            long_url: url,
            created_at: createdAt,
            idLink: info.lastID
        });
    } catch (error) {
        console.error(`Error POST /api-v1/ (${error.message})`);
        response.status(500).json({ error: "Erreur de création du lien." });
    }
});

app.get("/error", (request, response, next) => {
    next(new Error("Test Error 500"));
});

// TODO: Implement.
app.get("/:url", (request, response) => {
    response.status(501).json({ error: "Not implemented" });
});

// TODO: Implement.
app.get("/status/:url", (request, response) => {
    response.status(501).json({ error: "Not implemented" });
});

app.use((error, request, response, next) => {
    console.error(error.stack);
    response.status(500).json({ error: "Internal Server Error", message: error.message });
});

app.use((request, response, next) => {
    response.setHeader("X-API-version", 'v1');
    next();
});

async function startServer() {
    await initiateDatabase();

    app.listen(PORT, () => {
        console.log(`Server is running on http://${HOST}:${PORT}`);
        console.log("NODE_ENV =", process.env.NODE_ENV);
    });
}

startServer();
