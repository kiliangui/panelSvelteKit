import { PrismaClient } from "@prisma/client";

if (global.db) {
    throw new Error("db is already defined");
}
// import env variables from .env
import { config } from "dotenv";

config();
export const pterourl = process.env.PTERO_URL;
export const pteroAppKey = process.env.PTERO_API_KEY;
export const pteroUserKey = process.env.PTERO_USER_KEY;

export const db = new PrismaClient();