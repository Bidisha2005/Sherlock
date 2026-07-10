import { MongoClient } from "mongodb";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export const createMongoClient = async (): Promise<MongoClient | null> => {
  if (env.NODE_ENV === "test") return null;

  try {
    const client = new MongoClient(env.MONGODB_URI);
    await client.connect();
    logger.info("MongoDB connected");
    return client;
  } catch (error) {
    logger.warn("MongoDB unavailable; falling back to in-memory repositories", {
      message: error instanceof Error ? error.message : "unknown"
    });
    return null;
  }
};
