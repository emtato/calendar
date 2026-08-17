/**
 * Shared MongoDB connection setup.
 *
 * Create one MongoClient for the process and reuse it. Opening a new connection
 * inside every request handler is slow and can exhaust database connections.
 */
import {Db, MongoClient} from "mongodb";
import {env} from "./env.js";

let client: MongoClient | undefined;
let database: Db | undefined;

export async function getDatabase(): Promise<Db> {
    if (database) {
        return database;
    }

    if (!env.mongoUri) {
        throw new Error("MONGODB_URI is required before using MongoDB.");
    }

    client = new MongoClient(env.mongoUri);
    await client.connect();
    database = client.db();

    return database;
}

export async function closeDatabase(): Promise<void> {
    await client?.close();
    client = undefined;
    database = undefined;
}
