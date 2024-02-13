import { PrismaClient } from "@prisma/client";

if (global.db) {
    throw new Error("db is already defined");
}


// expose a singleton
export const db = new PrismaClient();