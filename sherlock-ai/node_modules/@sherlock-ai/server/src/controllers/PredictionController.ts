import { Request, Response } from "express";
import { Server } from "socket.io";
import { AppError } from "../errors/AppError";
import { PredictionService } from "../services/PredictionService";
import { meetingSnapshotSchema } from "../validators/snapshotSchema";

export class PredictionController {
  constructor(
    private readonly predictionService: PredictionService,
    private readonly io: Server
  ) {}

  createPrediction = async (req: Request, res: Response): Promise<void> => {
    const parsed = meetingSnapshotSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.message, 400, "INVALID_MEETING_SNAPSHOT");

    const result = await this.predictionService.predict(parsed.data);
    this.io.to(parsed.data.meetingId).emit("prediction.updated", result);
    res.status(201).json(result);
  };

  latestPrediction = async (req: Request, res: Response): Promise<void> => {
    const prediction = await this.predictionService.latest(req.params.meetingId);
    if (!prediction) throw new AppError("Prediction not found", 404, "PREDICTION_NOT_FOUND");
    res.json({ prediction });
  };
}
