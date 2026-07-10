import { Router } from "express";
import { HealthController } from "../controllers/HealthController";

export const healthRoutes = (controller: HealthController): Router => {
  const router = Router();
  router.get("/", controller.status);
  return router;
};
