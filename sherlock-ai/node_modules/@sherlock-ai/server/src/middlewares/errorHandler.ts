import { ErrorRequestHandler } from "express";
import { AppError } from "../errors/AppError";
import { logger } from "../utils/logger";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: { code: error.code, message: error.message } });
    return;
  }

  logger.error("Unhandled request error", { message: error instanceof Error ? error.message : "unknown" });
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Unexpected server error" } });
};
