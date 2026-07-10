import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: "../.env" });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/sherlock_ai"),
  JWT_SECRET: z.string().min(16).default("local-development-secret"),
  AI_SERVICE_URL: z.string().url().default("http://localhost:5001"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info")
});

export const env = envSchema.parse(process.env);
