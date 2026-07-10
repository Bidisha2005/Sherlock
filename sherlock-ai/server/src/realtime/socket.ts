import { Server } from "socket.io";
import { PredictionService } from "../services/PredictionService";
import { meetingSnapshotSchema } from "../validators/snapshotSchema";
import { logger } from "../utils/logger";

export const registerSocketHandlers = (io: Server, predictionService: PredictionService): void => {
  io.on("connection", (socket) => {
    logger.info("Socket connected", { socketId: socket.id });

    socket.on("meeting.join", ({ meetingId }: { meetingId: string }) => {
      socket.join(meetingId);
      logger.info("Socket joined meeting", { socketId: socket.id, meetingId });
    });

    socket.on("snapshot.ingest", async (payload) => {
      const parsed = meetingSnapshotSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit("snapshot.rejected", { reason: parsed.error.message });
        return;
      }

      const result = await predictionService.predict(parsed.data);
      io.to(parsed.data.meetingId).emit("prediction.updated", result);
    });

    socket.on("disconnect", () => {
      logger.info("Socket disconnected", { socketId: socket.id });
    });
  });
};
