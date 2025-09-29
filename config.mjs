import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const _fileName = fileURLToPath(import.meta.url);
const _directoryName = path.dirname(_fileName);

export const HOST = "localhost";
export const PORT = process.env.PORT;
export const LINK_LEN = process.env.LINK_LEN;
export const DB_FILE = process.env.DB_FILE;
export const DB_SCHEMA = process.env.DB_SCHEMA;
export const NODE_ENV = process.env.NODE_ENV;
export const DIRNAME = _directoryName;