import express from "express";
import favicon from 'serve-favicon';
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";

import * as config from "./config.mjs";
import { initiateDatabase } from "./database/database.mjs";
import apiV1Router from "./router/api-v1.mjs";

const _fileName = fileURLToPath(import.meta.url);
const _directoryName = path.dirname(_fileName);

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

app.use("/api-v1", apiV1Router);

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
    app.listen(config.PORT, () => {
        console.log(`Server is running on http://${config.HOST}:${config.PORT}`);
        console.log("NODE_ENV =", process.env.NODE_ENV);
    });
}

startServer();
