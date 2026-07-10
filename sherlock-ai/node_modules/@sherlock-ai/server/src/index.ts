import http from "node:http";
import { Server } from "socket.io";
import { createApp } from "./app";
import { env } from "./config/env";
import { createMongoClient } from "./database/mongo";
import { startLiveMeetingSimulator } from "./mock/liveMeetingSimulator";
import { InMemoryMeetingRepository, MongoMeetingRepository } from "./repositories/MeetingRepository";
import { InMemoryPredictionRepository, MongoPredictionRepository } from "./repositories/PredictionRepository";
import { registerSocketHandlers } from "./realtime/socket";
import { PredictionService } from "./services/PredictionService";
import { logger } from "./utils/logger";

const bootstrap = async (): Promise<void> => {
  const mongoClient = await createMongoClient();
  const db = mongoClient?.db();
  const meetingRepository = db ? new MongoMeetingRepository(db) : new InMemoryMeetingRepository();
  const predictionRepository = db ? new MongoPredictionRepository(db) : new InMemoryPredictionRepository();
  const predictionService = new PredictionService(meetingRepository, predictionRepository);

  const io = new Server({ cors: { origin: env.CLIENT_ORIGIN } });
  const app = createApp(io, predictionService);
  const server = http.createServer(app);

  io.attach(server);
  registerSocketHandlers(io, predictionService);
  startLiveMeetingSimulator(io, predictionService);

  server.listen(env.PORT, () => {
    logger.info("Sherlock AI server listening", { port: env.PORT });
  });
};

bootstrap().catch((error) => {
  logger.error("Server bootstrap failed", { message: error instanceof Error ? error.message : "unknown" });
  process.exit(1);
});
