import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { Server } from "socket.io";
import { env } from "./config/env";
import { HealthController } from "./controllers/HealthController";
import { PredictionController } from "./controllers/PredictionController";
import { errorHandler } from "./middlewares/errorHandler";
import { healthRoutes } from "./routes/healthRoutes";
import { predictionRoutes } from "./routes/predictionRoutes";
import { PredictionService } from "./services/PredictionService";

export const createApp = (io: Server, predictionService: PredictionService) => {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGIN }));
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan("combined"));

  app.use("/health", healthRoutes(new HealthController()));
  app.use("/api/predictions", predictionRoutes(new PredictionController(predictionService, io)));
  app.use(errorHandler);

  return app;
};
