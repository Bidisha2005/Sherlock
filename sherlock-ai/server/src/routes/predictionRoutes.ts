import { Router } from "express";
import { PredictionController } from "../controllers/PredictionController";

export const predictionRoutes = (controller: PredictionController): Router => {
  const router = Router();
  router.post("/", controller.createPrediction);
  router.get("/:meetingId/latest", controller.latestPrediction);
  return router;
};
