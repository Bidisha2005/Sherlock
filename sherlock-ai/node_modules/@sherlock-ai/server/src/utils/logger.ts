import { env } from "../config/env";

type LogContext = Record<string, string | number | boolean | undefined>;

export const logger = {
  debug(message: string, context: LogContext = {}) {
    if (env.LOG_LEVEL === "debug") console.debug(JSON.stringify({ level: "debug", message, ...context }));
  },
  info(message: string, context: LogContext = {}) {
    console.info(JSON.stringify({ level: "info", message, ...context }));
  },
  warn(message: string, context: LogContext = {}) {
    console.warn(JSON.stringify({ level: "warn", message, ...context }));
  },
  error(message: string, context: LogContext = {}) {
    console.error(JSON.stringify({ level: "error", message, ...context }));
  }
};
