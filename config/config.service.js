import dotenv from "dotenv";
import {resolve} from "node:path";

const NODE_ENV = process.env.NODE_ENV;

let envPaths = {
  development: "development.env",
  production: "production.env",
};
dotenv.config({path: resolve(`config/${envPaths[NODE_ENV]}`)});

export const PORT = +process.env.PORT;
export const SALT_ROUND = +process.env.SALT_ROUND;
export const DB_URI = process.env.DB_URI;
export const DB_URI_ONLINE = process.env.DB_URI_ONLINE;
export const ENCRYPT_SECRET_KEY = process.env.ENCRYPT_SECRET_KEY;
export const ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY;
export const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;
export const WEB_CLIENT_ID = process.env.WEB_CLIENT_ID;
export const REDIS_URI = process.env.REDIS_URI;
export const EMAIL = process.env.EMAIL;
export const PASSWORD = process.env.PASSWORD;
export const EXPIRES_IN = process.env.EXPIRES_IN;
export const WHITELIST = process.env.WHITELIST.split(",") || [];
export const CLOUD_NAME = process.env.CLOUD_NAME;
export const CLOUD_API_KEY = process.env.CLOUD_API_KEY;
export const CLOUD_API_SECRET = process.env.CLOUD_API_SECRET;
